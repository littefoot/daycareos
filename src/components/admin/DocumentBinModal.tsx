import React, { useState } from 'react';
import { ModalPortal } from '../common/ModalPortal';
import { 
  AS_NEEDED_DOCUMENT_TEMPLATES, 
  AsNeededDocumentTemplate, 
  AsNeededCategory 
} from '../../data/asNeededFormsData';
import { Child } from '../../types';
import { 
  FolderDown, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  X, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  BookOpen,
  Users,
  Baby,
  Home,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface DocumentBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  onOpenDispatchModal: (templateId: string, childId?: string) => void;
  onOpenFormBuilder?: (formId: string) => void;
}

export const DocumentBinModal: React.FC<DocumentBinModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  onOpenDispatchModal,
  onOpenFormBuilder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'parent' | 'provider'>('all');
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Documents (13)' },
    { id: 'Statutory Exemption', label: 'Statutory Exemptions (2)' },
    { id: 'Special Needs & Inclusion', label: 'Special Needs & ISP (2)' },
    { id: 'Operations & Safety', label: 'Safety & Incidents (3)' },
    { id: 'Provider Operations', label: 'Provider Planning & Menus (4)' },
    { id: 'Curriculum & Pedagogy', label: 'Curriculum & HDLH (2)' }
  ];

  const filteredDocs = AS_NEEDED_DOCUMENT_TEMPLATES.filter(doc => {
    // Audience filter
    if (selectedAudience !== 'all') {
      if (doc.targetAudience !== selectedAudience && doc.targetAudience !== 'both') {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchCode = doc.formCode.toLowerCase().includes(q);
      const matchDesc = doc.description.toLowerCase().includes(q);
      const matchTags = doc.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCode && !matchDesc && !matchTags) {
        return false;
      }
    }

    return true;
  });

  const handleCopyLink = (doc: AsNeededDocumentTemplate) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}${doc.pdfUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2500);
  };

  return (
    <ModalPortal>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      >
        <div 
          className="bg-white border-2 border-slate-900 rounded-3xl shadow-neo max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="px-6 py-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b-2 border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-neo-sm">
                <FolderDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Agency Document Bin & As-Needed Distribution
                  </h2>
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-slate-900 text-white rounded-full">
                    13 Templates
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Official Ontario Ministry and ACCS templates from the agency's shared drive ready for targeted dispatch or download.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="px-6 py-4 bg-slate-50 border-b-2 border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by form code (SUP-4, ISP), keyword, vaccine, allergy, schedule..."
                  className="w-full bg-white border-2 border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 outline-none transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Audience Segmented Filter */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-300 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedAudience('all')}
                  className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                    selectedAudience === 'all'
                      ? 'bg-slate-900 text-white shadow-neo-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({AS_NEEDED_DOCUMENT_TEMPLATES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAudience('parent')}
                  className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                    selectedAudience === 'parent'
                      ? 'bg-orange-500 text-white shadow-neo-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Parents
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAudience('provider')}
                  className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                    selectedAudience === 'provider'
                      ? 'bg-amber-600 text-white shadow-neo-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Providers
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 font-bold rounded-full border transition-all shrink-0 cursor-pointer text-[11px] ${
                    selectedCategory === cat.id
                      ? 'bg-orange-100 text-orange-950 border-orange-400 shadow-neo-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50">
            {filteredDocs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-sm text-slate-700">No documents match your filter criteria.</p>
                <p className="text-xs">Try resetting your search query or category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map(doc => {
                  const isParentDoc = doc.targetAudience === 'parent' || doc.targetAudience === 'both';
                  const isCopied = copiedDocId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-neo-sm hover:shadow-neo transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs bg-slate-900 text-white px-2 py-0.5 rounded-lg">
                              {doc.formCode}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              {doc.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              doc.targetAudience === 'parent' ? 'bg-orange-100 text-orange-800' :
                              doc.targetAudience === 'provider' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {doc.targetAudience}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              {doc.fileSizeFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Document Title */}
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                            {doc.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {doc.statutoryReference}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {doc.description}
                        </p>

                        {/* Digital Schema Link if Available */}
                        {doc.digitalFormId && (
                          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Interactive Digital Form Enabled (Editable in Form Builder & AI Assistant)</span>
                            </div>
                            {onOpenFormBuilder && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenFormBuilder(doc.digitalFormId!);
                                }}
                                className="text-[10px] font-black text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 self-start sm:self-auto shrink-0"
                                title="Open and edit this form schema in Form Builder Studio"
                              >
                                <span>Customize Schema</span>
                                <ArrowRight className="w-3 h-3 text-emerald-700" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Direct PDF Link */}
                          <a
                            href={doc.pdfUrl}
                            download={doc.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="neo-btn bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 px-2.5 py-1.5 text-[11px] font-bold gap-1 cursor-pointer"
                            title="Open or download official PDF template"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-600" />
                            <span>Download PDF</span>
                          </a>

                          {/* Copy Link */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(doc)}
                            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="Copy direct link to blank PDF"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                          </button>
                        </div>

                        {/* Dispatch Button */}
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenDispatchModal(doc.id);
                          }}
                          className="neo-btn bg-orange-500 hover:bg-orange-600 text-white border-slate-900 px-3 py-1.5 text-[11px] font-extrabold gap-1.5 cursor-pointer shadow-neo-sm"
                          title="Dispatch this form to a child or family"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 bg-white border-t-2 border-slate-900 flex items-center justify-between text-xs text-slate-500">
            <span>
              All 12 client-provided templates are stored locally in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">/public/documents/bin/</code> for zero external cloud dependency.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="neo-btn bg-slate-900 hover:bg-slate-800 text-white border-slate-900 px-4 py-1.5 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
