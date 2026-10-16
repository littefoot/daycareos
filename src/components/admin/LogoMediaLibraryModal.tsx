import React, { useState, useRef } from 'react';
import { ModalPortal } from '../common/ModalPortal';
import { AgencyLogoRecord } from '../../types';
import { 
  AGENCY_ENTITIES, 
  AgencyEntityDetails, 
  saveLogosToStorage,
  saveActivePrintEntity,
  saveActivePrintLogoId 
} from '../../data/agencyLogosData';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { 
  Check, 
  Upload, 
  Trash2, 
  Sparkles, 
  Building2, 
  Image as ImageIcon, 
  X, 
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LogoMediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logosList: AgencyLogoRecord[];
  activeLogoId: string;
  activeEntity: any;
  onSelectLogo: (logo: AgencyLogoRecord) => void;
  onSelectEntity: (entity: any) => void;
  onUpdateLogosList: (updatedList: AgencyLogoRecord[]) => void;
}

export const LogoMediaLibraryModal: React.FC<LogoMediaLibraryModalProps> = ({
  isOpen,
  onClose,
  logosList,
  activeLogoId,
  activeEntity,
  onSelectLogo,
  onSelectEntity,
  onUpdateLogosList
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  
  // Custom upload form state
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoEntity, setNewLogoEntity] = useState<any>('custom');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentActiveLogo = logosList.find(l => l.id === activeLogoId) || logosList[0];
  const currentEntityMeta: AgencyEntityDetails = AGENCY_ENTITIES[activeEntity];

  // Entity Switching
  const handleSwitchEntity = (entity: any) => {
    onSelectEntity(entity);
    saveActivePrintEntity(entity);

    // Auto-select the corresponding master logo for this entity
    const targetEntityLogo = logosList.find(l => l.agencyEntity === entity) || logosList[0];
    if (targetEntityLogo) {
      onSelectLogo(targetEntityLogo);
      saveActivePrintLogoId(targetEntityLogo.id);
    }
  };

  // Select a logo
  const handlePickLogo = (logo: AgencyLogoRecord) => {
    onSelectLogo(logo);
    saveActivePrintLogoId(logo.id);
    if (logo.agencyEntity === 'accs' || logo.agencyEntity === 'circles_in_the_sun') {
      onSelectEntity(logo.agencyEntity);
      saveActivePrintEntity(logo.agencyEntity);
    }
  };

  // Handle local file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    setSelectedFile(file);
    if (!newLogoName) {
      setNewLogoName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload and Save Logo
  const handleSaveUploadedLogo = async () => {
    if (!previewDataUrl || !newLogoName.trim()) {
      alert('Please provide a logo image and label.');
      return;
    }

    setIsUploading(true);
    let finalUrl = previewDataUrl;
    let sourceType: AgencyLogoRecord['sourceType'] = 'uploaded';

    // Attempt Firebase Storage Upload if online
    if (selectedFile) {
      try {
        const fileExt = selectedFile.name.split('.').pop() || 'png';
        const storagePath = `logos/custom_${Date.now()}.${fileExt}`;
        const logoRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(logoRef, selectedFile, {
          contentType: selectedFile.type
        });
        finalUrl = await getDownloadURL(snapshot.ref);
        sourceType = 'firebase_storage';
      } catch (err) {
        console.warn('Firebase Storage upload fallback to dataURL:', err);
        finalUrl = previewDataUrl;
      }
    }

    const newLogoRecord: AgencyLogoRecord = {
      id: `logo-custom-${Date.now()}`,
      name: newLogoName.trim(),
      agencyEntity: newLogoEntity,
      url: finalUrl,
      localFallbackUrl: previewDataUrl,
      isDefault: false,
      sourceType,
      printHeightPx: 52,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newLogoRecord, ...logosList];
    onUpdateLogosList(updated);
    saveLogosToStorage(updated);

    // Auto-select this uploaded logo
    handlePickLogo(newLogoRecord);

    setIsUploading(false);
    setUploadNotice(`Logo "${newLogoName}" added and set as active print mark!`);
    setActiveTab('library');
    setPreviewDataUrl(null);
    setSelectedFile(null);
    setNewLogoName('');
    setTimeout(() => setUploadNotice(null), 3500);
  };

  // Delete Custom Logo
  const handleDeleteCustomLogo = (logoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this custom logo from the library?')) return;

    const updated = logosList.filter(l => l.id !== logoId);
    onUpdateLogosList(updated);
    saveLogosToStorage(updated);

    // If active was deleted, fallback to default
    if (activeLogoId === logoId) {
      handlePickLogo(updated[0]);
    }
  };

  return (
    <ModalPortal>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white border-2 border-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col space-y-5 cursor-default"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-black text-slate-900">
                  Agency Logo & Entity Media Library
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select or upload official vector logos for all Ministry audit binder packets, child master dossiers, and physical forms.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner notification */}
          {uploadNotice && (
            <div className="bg-emerald-50 border-2 border-emerald-600 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadNotice}</span>
            </div>
          )}

          {/* Section 1: Sister Company Entity Switcher */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
                <span>Active Print Organization / Sister Agency</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Switches logo, legal name & Ministry credentials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: DaycareOS */}
              <div
                onClick={() => handleSwitchEntity('accs')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  activeEntity === 'accs'
                    ? 'bg-orange-50 border-orange-600 shadow-neo-sm'
                    : 'bg-white border-slate-300 hover:border-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img 
                      src="/logos/all_child_care_solutions.png" 
                      alt="ACCS" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">DaycareOS</h4>
                    <p className="text-[10px] text-slate-500">Primary Agency • {AGENCY_ENTITIES.accs.code}</p>
                  </div>
                </div>

                {activeEntity === 'accs' && (
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Option 2: Circles in the Sun */}
              <div
                onClick={() => handleSwitchEntity('circles_in_the_sun')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  activeEntity === 'circles_in_the_sun'
                    ? 'bg-amber-50 border-amber-600 shadow-neo-sm'
                    : 'bg-white border-slate-300 hover:border-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img 
                      src="/logos/circles_in_the_sun.png" 
                      alt="Circles in the Sun" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Circles in the Sun</h4>
                    <p className="text-[10px] text-slate-500">Sister Company • {AGENCY_ENTITIES.circles_in_the_sun.code}</p>
                  </div>
                </div>

                {activeEntity === 'circles_in_the_sun' && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Library & Upload Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'library'
                    ? 'bg-slate-900 text-white border-2 border-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Registered Logos ({logosList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-orange-500 text-white border-2 border-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Logo</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-semibold">
              Currently Selected: <strong className="text-slate-900">{currentActiveLogo.name}</strong>
            </span>
          </div>

          {/* Tab Content 1: Logo Media Library Grid */}
          {activeTab === 'library' && (
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[46vh] pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {logosList.map((logo) => {
                  const isSelected = logo.id === currentActiveLogo.id;

                  return (
                    <div
                      key={logo.id}
                      onClick={() => handlePickLogo(logo)}
                      className={`bg-white border-2 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer relative group ${
                        isSelected 
                          ? 'border-orange-500 ring-2 ring-orange-400 bg-orange-50/20 shadow-neo-sm' 
                          : 'border-slate-300 hover:border-slate-900 hover:shadow-xs'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          logo.agencyEntity === 'accs'
                            ? 'bg-orange-100 text-orange-900 border-orange-300'
                            : logo.agencyEntity === 'circles_in_the_sun'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-purple-100 text-purple-900 border-purple-300'
                        }`}>
                          {logo.agencyEntity === 'accs' ? 'ACCS' : logo.agencyEntity === 'circles_in_the_sun' ? 'Circles in the Sun' : 'Custom'}
                        </span>

                        <span className="text-[9px] font-mono text-slate-500">
                          {logo.sourceType === 'firebase_storage' ? 'Cloud Storage' : 'Local Asset'}
                        </span>
                      </div>

                      {/* Logo Preview Stage (White Canvas) */}
                      <div className="h-24 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center my-2 overflow-hidden shadow-inner">
                        <img
                          src={logo.url}
                          alt={logo.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            if (logo.localFallbackUrl) {
                              (e.target as HTMLImageElement).src = logo.localFallbackUrl;
                            }
                          }}
                        />
                      </div>

                      {/* Name & Selection CTA */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate" title={logo.name}>
                          {logo.name}
                        </p>

                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected ? (
                            <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <button className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-md border border-slate-300">
                              Select
                            </button>
                          )}

                          {logo.sourceType === 'uploaded' && (
                            <button
                              onClick={(e) => handleDeleteCustomLogo(logo.id, e)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete logo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content 2: Upload New Logo Form */}
          {activeTab === 'upload' && (
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[46vh] p-4 bg-slate-50 rounded-2xl border-2 border-slate-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File picker drop area */}
                <div>
                  <label className="text-xs font-extrabold text-slate-900 block mb-1">
                    Select Logo File (PNG, SVG, WEBP)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-400 hover:border-slate-900 rounded-2xl p-6 text-center bg-white cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]"
                  >
                    <Upload className="w-6 h-6 text-orange-500 mb-2" />
                    <p className="text-xs font-bold text-slate-800">
                      {selectedFile ? selectedFile.name : 'Click to Browse Logo File'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Transparent background PNG or SVG recommended
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preview and Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-1">
                      Logo Label / Description
                    </label>
                    <input
                      type="text"
                      value={newLogoName}
                      onChange={(e) => setNewLogoName(e.target.value)}
                      placeholder="e.g. Summer Camp 2026 Mark"
                      className="w-full p-2 bg-white border-2 border-slate-900 rounded-xl font-bold text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-900 block mb-1">
                      Associated Agency Entity
                    </label>
                    <select
                      value={newLogoEntity}
                      onChange={(e) => setNewLogoEntity(e.target.value as any)}
                      className="w-full p-2 bg-white border-2 border-slate-900 rounded-xl font-bold text-xs focus:outline-none"
                    >
                      <option value="accs">DaycareOS (ACCS)</option>
                      <option value="circles_in_the_sun">Circles in the Sun</option>
                      <option value="custom">Generic / Custom Partner</option>
                    </select>
                  </div>

                  {previewDataUrl && (
                    <div className="bg-white p-3 rounded-xl border border-slate-300">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase">Instant Preview</p>
                      <div className="h-16 flex items-center justify-center bg-slate-50 rounded-lg p-1">
                        <img src={previewDataUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSaveUploadedLogo}
                    disabled={isUploading || !previewDataUrl}
                    className={`w-full neo-btn bg-orange-500 hover:bg-orange-400 text-white p-2.5 text-xs font-extrabold gap-2 shadow-neo-sm justify-center cursor-pointer ${
                      isUploading || !previewDataUrl ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <span>Uploading to Firebase Storage...</span>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Save & Use in Printouts</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Live Preview Bar */}
          <div className="bg-slate-100 p-3.5 rounded-2xl border-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-12 w-28 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shrink-0">
                <img
                  src={currentActiveLogo.url}
                  alt={currentActiveLogo.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    if (currentActiveLogo.localFallbackUrl) {
                      (e.target as HTMLImageElement).src = currentActiveLogo.localFallbackUrl;
                    }
                  }}
                />
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Live Print Header Preview</p>
                <p className="font-extrabold text-slate-900 text-sm leading-tight">{currentEntityMeta.name}</p>
                <p className="text-[10px] text-slate-600">{currentEntityMeta.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold gap-1.5 shadow-neo-sm cursor-pointer ml-auto"
            >
              <span>Apply & Return to Binder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
