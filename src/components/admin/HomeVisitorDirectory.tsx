import React, { useState, useEffect } from 'react';
import { HomeVisitor, Provider, HomeInspectionRecord, RegionType } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { AccsDatePicker } from '../common/AccsDatePicker';
import { Avatar } from '../common/Avatar';
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Search,
  Users,
  Copy,
  Check,
  ExternalLink,
  Video
} from 'lucide-react';

interface HomeVisitorDirectoryProps {
  visitorsList: HomeVisitor[];
  providersList: Provider[];
  inspectionsList: HomeInspectionRecord[];
  onAddVisitor: (visitor: HomeVisitor) => void;
  onUpdateVisitor: (visitor: HomeVisitor) => void;
  onDeleteVisitor: (visitorId: string) => void;
  onNavigateToVisitorPortal?: (visitorId: string) => void;
  openAddTrigger?: number;
}

export const HomeVisitorDirectory: React.FC<HomeVisitorDirectoryProps> = ({
  visitorsList,
  providersList,
  inspectionsList,
  onAddVisitor,
  onUpdateVisitor,
  onDeleteVisitor,
  onNavigateToVisitorPortal,
  openAddTrigger
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<HomeVisitor | null>(null);
  const [copiedVisitorId, setCopiedVisitorId] = useState<string | null>(null);

  // Form State for Add / Edit Visitor
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('Home Child Care Visitor, RECE');
  const [formRece, setFormRece] = useState('');
  const [formReceExpiry, setFormReceExpiry] = useState('');
  const [formComplianceVideo, setFormComplianceVideo] = useState('');
  const [formVscExpiry, setFormVscExpiry] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRegion, setFormRegion] = useState<RegionType>('Durham Region');
  const [formPhoto, setFormPhoto] = useState('');
  const [formAssignedProviders, setFormAssignedProviders] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setEditingVisitor(null);
    setFormName('');
    setFormTitle('Home Child Care Visitor, RECE');
    setFormRece('RECE #');
    setFormReceExpiry('2027-04-30');
    setFormComplianceVideo('https://drive.google.com/drive/folders/accs-visitor-training');
    setFormVscExpiry('2028-08-01');
    setFormPhone('');
    setFormEmail('');
    setFormRegion('Durham Region');
    setFormPhoto('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256');
    setFormAssignedProviders([]);
    setIsAddModalOpen(true);
  };

  // Listen for open trigger from parent sub-nav
  useEffect(() => {
    if (openAddTrigger && openAddTrigger > 0) {
      handleOpenAdd();
    }
  }, [openAddTrigger]);

  const handleOpenEdit = (v: HomeVisitor) => {
    setEditingVisitor(v);
    setFormName(v.name);
    setFormTitle(v.title);
    setFormRece(v.receNumber);
    setFormReceExpiry(v.receExpiryDate || '');
    setFormComplianceVideo(v.complianceVideoUrl || '');
    setFormVscExpiry(v.vscExpiryDate || '');
    setFormPhone(v.phone);
    setFormEmail(v.email);
    setFormRegion(v.region);
    setFormPhoto(v.photoUrl);
    setFormAssignedProviders(v.assignedProviderIds);
    setIsAddModalOpen(true);
  };

  const handleSaveVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingVisitor) {
      const updated: HomeVisitor = {
        ...editingVisitor,
        name: formName.trim(),
        title: formTitle.trim(),
        receNumber: formRece.trim(),
        receExpiryDate: formReceExpiry || editingVisitor.receExpiryDate,
        complianceVideoUrl: formComplianceVideo || editingVisitor.complianceVideoUrl,
        vscExpiryDate: formVscExpiry || editingVisitor.vscExpiryDate,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        region: formRegion,
        photoUrl: formPhoto || editingVisitor.photoUrl,
        assignedProviderIds: formAssignedProviders
      };
      onUpdateVisitor(updated);
    } else {
      const newVisitor: HomeVisitor = {
        id: `visitor-${Date.now()}`,
        name: formName.trim(),
        title: formTitle.trim(),
        receNumber: formRece.trim() || 'RECE #Pending',
        receExpiryDate: formReceExpiry || '2027-04-30',
        complianceVideoUrl: formComplianceVideo || 'https://drive.google.com/drive/folders/accs-visitor-training',
        vscExpiryDate: formVscExpiry || '2028-08-01',
        phone: formPhone.trim() || '(905) 555-0100',
        email: formEmail.trim(),
        region: formRegion,
        photoUrl: formPhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256',
        assignedProviderIds: formAssignedProviders,
        activeStatus: 'active',
        hireDate: new Date().toISOString().split('T')[0]
      };
      onAddVisitor(newVisitor);
    }

    setIsAddModalOpen(false);
  };

  const toggleProviderAssignment = (providerId: string) => {
    setFormAssignedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const filteredVisitors = visitorsList.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.receNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || v.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls & Header */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-neo-sm">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-extrabold text-slate-900">Home Child Care Visitors Directory</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              CCEYA Reg. 137/15 Mandate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Agency RECE field staff authorized to conduct mandatory quarterly in-home inspections, spot-checks, and placement readiness reviews.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by visitor name, RECE number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="font-bold text-slate-600 ml-1">Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Service Regions</option>
            <option value="Durham Region">Durham Region (Oshawa, Whitby)</option>
            <option value="York Region">York Region (Markham)</option>
            <option value="Toronto">Toronto / Scarborough</option>
          </select>
        </div>
      </div>

      {/* Visitors Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVisitors.map(visitor => {
          const assignedProviders = providersList.filter(p => visitor.assignedProviderIds.includes(p.id));
          const visitorInspections = inspectionsList.filter(i => i.visitorId === visitor.id);
          const latestInspection = visitorInspections[0];

          return (
            <div 
              key={visitor.id}
              className="bg-white rounded-2xl border-2 border-slate-900 p-5 transition-all flex flex-col justify-between shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 gap-4"
            >
              <div className="space-y-3">
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-slate-100">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={visitor.name}
                      photoUrl={visitor.photoUrl}
                      size="lg"
                      className="rounded-xl border-2 border-slate-900 shadow-2xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base text-slate-900 leading-tight">{visitor.name}</h3>
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                          {visitor.receNumber}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">{visitor.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{visitor.region}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top-Right Magic Link Actions */}
                  <div className="flex items-center bg-orange-50/90 border-2 border-slate-900 rounded-xl p-0.5 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const magicVisitorUrl = `${window.location.origin}${window.location.pathname}?role=visitor&visitorId=${visitor.id}`;
                        navigator.clipboard.writeText(magicVisitorUrl);
                        setCopiedVisitorId(visitor.id);
                        setTimeout(() => setCopiedVisitorId(null), 3000);
                      }}
                      className="bg-white hover:bg-orange-100 text-orange-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-orange-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      title={`Copy direct magic field portal link for ${visitor.name}`}
                    >
                      {copiedVisitorId === visitor.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-800">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-orange-600" />
                          <span>Magic Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`/?role=visitor&visitorId=${visitor.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 px-1.5 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                      title="Open Field Portal in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Standardized Contact Bar */}
                <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <a href={`tel:${visitor.phone}`} className="flex items-center gap-1.5 hover:text-orange-600 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{visitor.phone}</span>
                  </a>
                  <a href={`mailto:${visitor.email}`} className="flex items-center gap-1.5 hover:text-orange-600 font-medium truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{visitor.email}</span>
                  </a>
                </div>

                {/* RECE License & Compliance Video Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-orange-50/70 border border-orange-200 rounded-xl text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span><strong>RECE License:</strong> {visitor.receNumber}</span>
                    {visitor.receExpiryDate && (
                      <span className="text-slate-500 font-mono text-[10px]">(Renews: {visitor.receExpiryDate})</span>
                    )}
                  </div>
                  <a
                    href={visitor.complianceVideoUrl || 'https://drive.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-900 bg-white border border-orange-300 px-2.5 py-1 rounded-lg hover:bg-orange-100 transition-colors shadow-2xs"
                  >
                    <Video className="w-3 h-3 text-orange-600" />
                    <span>Training Videos</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                </div>

                {/* Assigned Caseload Section */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-orange-500" />
                      <span>Assigned Provider Homes ({assignedProviders.length})</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Standard: 15–25 homes
                    </span>
                  </div>

                  {assignedProviders.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedProviders.map(p => (
                        <span 
                          key={p.id}
                          className="bg-white border border-slate-300 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          <span>{p.name}</span>
                          <span className="text-[9px] text-slate-400">({p.neighborhood})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No provider homes currently assigned to this visitor.</p>
                  )}
                </div>

                {/* Latest Inspection Note */}
                {latestInspection && (
                  <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs">
                    <div className="flex items-center justify-between text-emerald-950 font-bold">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Last Audit: {latestInspection.providerName}</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700">{latestInspection.inspectionDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                      "{latestInspection.notes || 'All safety standards met. Ratio compliant.'}"
                    </p>
                  </div>
                )}
              </div>

              {/* Standardized Card Footer */}
              <div className="pt-3 border-t-2 border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 font-medium flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Caseload:</span>
                  <span className="font-bold text-slate-900">{assignedProviders.length} Assigned Homes</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {onNavigateToVisitorPortal && (
                    <button
                      type="button"
                      onClick={() => onNavigateToVisitorPortal(visitor.id)}
                      className="neo-btn bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300 px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
                      title={`Launch field portal as ${visitor.name}`}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-purple-700" />
                      <span>Launch Portal</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(visitor)}
                    className="neo-btn bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-300 px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
                    title="Edit Visitor & Caseload"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${visitor.name} from the active roster?`)) {
                        onDeleteVisitor(visitor.id);
                      }
                    }}
                    className="neo-btn bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 border-slate-300 hover:border-red-300 px-2.5 py-1.5 text-xs font-bold gap-1 cursor-pointer"
                    title="Remove Visitor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Visitor Modal */}
      {isAddModalOpen && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddModalOpen(false);
            }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-2 border-slate-900 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn cursor-default"
            >
              <div className="flex items-center justify-between p-5 border-b-2 border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-black text-slate-900">
                    {editingVisitor ? 'Edit Home Visitor Profile' : 'Register New Home Visitor (RECE)'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveVisitor} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 text-xs font-bold text-slate-700 flex-1">
              <div>
                <label className="block mb-1">Full Legal Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Vance, RECE"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">College of ECE License #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RECE #88219"
                    value={formRece}
                    onChange={(e) => setFormRece(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Service Region</label>
                  <select
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value as RegionType)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl focus:outline-none"
                  >
                    <option value="Durham Region">Durham Region</option>
                    <option value="York Region">York Region</option>
                    <option value="Toronto">Toronto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Primary Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="(905) 555-0199"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Agency Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@daycare-os.ca"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Compliance Dates & Training URL */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-2xl">
                <div>
                  <label className="block mb-1 text-[11px] font-bold text-slate-700">RECE Annual Renewal Date</label>
                  <AccsDatePicker
                    value={formReceExpiry}
                    onChange={setFormReceExpiry}
                    mode="future"
                    placeholder="YYYY-MM-DD"
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px] font-bold text-slate-700">VSC Police Check Expiry (5yr)</label>
                  <AccsDatePicker
                    value={formVscExpiry}
                    onChange={setFormVscExpiry}
                    mode="future"
                    placeholder="YYYY-MM-DD"
                    className="w-full text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1 text-[11px]">Google Drive Video Training URL</label>
                  <input
                    type="url"
                    value={formComplianceVideo}
                    onChange={(e) => setFormComplianceVideo(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium text-xs"
                  />
                </div>
              </div>

              {/* Provider Caseload Selection */}
              <div>
                <label className="block mb-1 text-slate-900">
                  Assign Provider Homes (Caseload):
                </label>
                <div className="max-h-40 overflow-y-auto p-2 bg-slate-50 border-2 border-slate-900 rounded-xl space-y-1.5">
                  {providersList.map(p => {
                    const isSelected = formAssignedProviders.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-orange-100/70 border border-orange-300' : 'bg-white hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProviderAssignment(p.id)}
                            className="rounded text-orange-500 focus:ring-orange-400"
                          />
                          <span className="font-bold text-slate-800">{p.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({p.homeName})</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-600">{p.region}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2 font-black cursor-pointer"
                >
                  {editingVisitor ? 'Save Changes' : 'Register Home Visitor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ModalPortal>
      )}
    </div>
  );
};
