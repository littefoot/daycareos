import React, { useState, useEffect } from 'react';
import { 
  GatedNote, 
  NoteTargetType, 
  NoteCategory, 
  NoteVisibilityTier, 
  NoteUserContext,
  canUserReadNote, 
  getAllowedVisibilityTiersForRole 
} from '../../../types/notes';
import { Child, Provider, ParentGuardian, UserRole } from '../../../types';
import { loadGatedNotes, saveGatedNotes, addGatedNote, deleteGatedNote } from '../../../data/initialNotesData';
import { ModalPortal } from '../ModalPortal';
import { 
  X, 
  Plus, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  User, 
  Calendar, 
  Tag, 
  Trash2, 
  Search, 
  FileText, 
  Baby, 
  Home, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface GatedNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: NoteTargetType;
  targetId: string;
  targetName: string;
  currentUser: NoteUserContext;
  targetChild?: Child;
  targetProvider?: Provider;
  allChildren?: Child[];
  allProviders?: Provider[];
}

export const GatedNotesModal: React.FC<GatedNotesModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  currentUser,
  targetChild,
  targetProvider
}) => {
  const [notes, setNotes] = useState<GatedNote[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'external' | 'internal'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  // New Note State
  const allowedTiers = getAllowedVisibilityTiersForRole(currentUser.role, targetType);
  const [selectedTier, setSelectedTier] = useState<NoteVisibilityTier>(allowedTiers[0]?.tier || 'parents_and_staff');
  const [category, setCategory] = useState<NoteCategory>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Load notes on open or target change
  useEffect(() => {
    if (isOpen) {
      const all = loadGatedNotes();
      setNotes(all);
    }
  }, [isOpen, targetId]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Reset composer tier when user role or target changes
    if (allowedTiers[0]) {
      setSelectedTier(allowedTiers[0].tier);
    }
  }, [currentUser.role, targetId]);

  if (!isOpen) return null;

  // Filter notes belonging to this target and readable by this user
  const relevantNotes = notes.filter(n => n.targetType === targetType && n.targetId === targetId);
  const readableNotes = relevantNotes.filter(n => canUserReadNote(n, currentUser, targetChild, targetProvider));

  // Apply UI filters
  const filteredNotes = readableNotes.filter(n => {
    if (filterType === 'external' && n.type !== 'external') return false;
    if (filterType === 'internal' && n.type !== 'internal') return false;
    if (filterCategory !== 'all' && n.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchAuthor = n.authorName.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchAuthor) return false;
    }
    return true;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const chosenTierObj = allowedTiers.find(t => t.tier === selectedTier) || allowedTiers[0];
    const newNote = addGatedNote({
      targetType,
      targetId,
      targetName,
      authorId: currentUser.userId,
      authorName: currentUser.userName,
      authorRole: currentUser.role,
      authorInitials: currentUser.userName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
      type: chosenTierObj.type,
      visibilityTier: selectedTier,
      category,
      title: title.trim() || undefined,
      content: content.trim()
    });

    setNotes(prev => [newNote, ...prev]);
    setTitle('');
    setContent('');
    setIsComposing(false);

    setNotificationMsg('Note recorded and secured with role gating.');
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Delete this note from the record?')) {
      deleteGatedNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
  };

  const getTierBadge = (tier: NoteVisibilityTier) => {
    switch (tier) {
      case 'parents_and_staff':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Unlock className="w-3 h-3 text-emerald-700" />
            <span>External • Family Visible</span>
          </span>
        );
      case 'provider_team':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
            <ShieldCheck className="w-3 h-3 text-blue-700" />
            <span>Internal • Provider Team</span>
          </span>
        );
      case 'visitor_and_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
            <Lock className="w-3 h-3 text-purple-700" />
            <span>Confidential • Visitor & Admin</span>
          </span>
        );
      case 'admin_only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-950 border border-rose-300">
            <Lock className="w-3 h-3 text-rose-700" />
            <span>Restricted • Director Only</span>
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: NoteCategory) => {
    switch (cat) {
      case 'daily_care':
        return 'Daily Care & Routine';
      case 'health_medical':
        return 'Health & Medical';
      case 'pickup_custody':
        return 'Pickup & Custody';
      case 'incident':
        return 'Incident & Observation';
      case 'compliance_audit':
        return 'Compliance & Audit';
      case 'general':
      default:
        return 'General Note';
    }
  };

  return (
    <ModalPortal>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto cursor-pointer"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white border-2 border-slate-900 rounded-3xl shadow-neo-lg w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 cursor-default"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b-2 border-slate-900 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 border-2 border-slate-900 flex items-center justify-center shadow-neo-sm shrink-0">
                {targetType === 'child' ? (
                  <Baby className="w-5 h-5 text-white" />
                ) : (
                  <Home className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {targetName} — Gated Notes
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                    {targetType === 'child' ? 'Child Record' : 'Provider Record'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                  <span>Viewing as:</span>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                    {currentUser.role} ({currentUser.userName})
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors shadow-neo-sm shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Header: Toolbar & Filters */}
          <div className="p-3 sm:p-4 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
            {/* Left: View Filter Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 shadow-sm">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({readableNotes.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('external')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterType === 'external'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                External ({readableNotes.filter(n => n.type === 'external').length})
              </button>
              {currentUser.role !== 'parent' && (
                <button
                  type="button"
                  onClick={() => setFilterType('internal')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterType === 'internal'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Internal ({readableNotes.filter(n => n.type === 'internal').length})
                </button>
              )}
            </div>

            {/* Category Dropdown & Search Input */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="pl-8 pr-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-500 shadow-sm w-36 sm:w-44"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 shadow-sm"
              >
                <option value="all">All Categories</option>
                <option value="daily_care">Daily Care & Routine</option>
                <option value="health_medical">Health & Medical</option>
                <option value="pickup_custody">Pickup & Custody</option>
                <option value="incident">Incident & Observation</option>
                <option value="compliance_audit">Compliance & Audit</option>
                <option value="general">General</option>
              </select>

              {!isComposing && (
                <button
                  type="button"
                  onClick={() => setIsComposing(true)}
                  className="neo-btn bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 font-bold gap-1 text-xs shadow-neo-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {notificationMsg && (
            <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notificationMsg}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
            {/* Inline Note Composer */}
            {isComposing && (
              <form 
                onSubmit={handleCreateNote}
                className="bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-5 shadow-neo space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <span className="font-extrabold text-sm text-slate-900">
                      Compose Authorized Note
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>

                {/* Audience / Visibility Tier Gating Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 block">
                    Visibility & Gating Tier (Who Can Read This Note):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allowedTiers.map((t) => (
                      <label
                        key={t.tier}
                        className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-0.5 text-xs ${
                          selectedTier === t.tier
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            <input
                              type="radio"
                              name="visibilityTier"
                              value={t.tier}
                              checked={selectedTier === t.tier}
                              onChange={() => setSelectedTier(t.tier)}
                              className="accent-orange-500"
                            />
                            {t.label}
                          </span>
                        </div>
                        <p className={`text-[10px] pl-5 leading-tight ${selectedTier === t.tier ? 'text-slate-300' : 'text-slate-500'}`}>
                          {t.description}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category & Title Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as NoteCategory)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="general">General</option>
                      <option value="daily_care">Daily Care & Routine</option>
                      <option value="health_medical">Health & Medical</option>
                      <option value="pickup_custody">Pickup & Custody</option>
                      <option value="incident">Incident & Observation</option>
                      {currentUser.role !== 'parent' && (
                        <option value="compliance_audit">Compliance & Audit</option>
                      )}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                      Subject / Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Grandma pickup at 4:15pm, allergy update, nap routine..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Content Textarea */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Note Details *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    placeholder="Type note details here..."
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 font-extrabold text-xs shadow-neo-sm cursor-pointer"
                  >
                    Save & Post Note
                  </button>
                </div>
              </form>
            )}

            {/* Note Feed List */}
            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">No notes found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || filterCategory !== 'all' || filterType !== 'all'
                    ? 'No notes match your current search or category filters.'
                    : currentUser.role === 'parent'
                      ? 'No notes from caregivers or family recorded yet for this child.'
                      : 'No gated notes recorded yet. Click [New Note] to document observations or instructions.'}
                </p>
                {!isComposing && (
                  <button
                    type="button"
                    onClick={() => setIsComposing(true)}
                    className="mt-2 neo-btn bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold gap-1 inline-flex"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Note</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => {
                  const isAuthor = note.authorId === currentUser.userId;
                  const canDelete = currentUser.role === 'admin' || isAuthor;

                  return (
                    <div
                      key={note.id}
                      className={`bg-white rounded-2xl border-2 p-4 space-y-2.5 transition-all shadow-sm ${
                        note.type === 'internal'
                          ? 'border-slate-800/80 bg-slate-50/40'
                          : 'border-slate-900'
                      }`}
                    >
                      {/* Top Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTierBadge(note.visibilityTier)}
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {getCategoryLabel(note.category)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(note.createdAt).toLocaleDateString('en-CA', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Content */}
                      <div>
                        {note.title && (
                          <h4 className="font-extrabold text-xs text-slate-950 mb-1">
                            {note.title}
                          </h4>
                        )}
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      </div>

                      {/* Author Line */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-black text-[9px] text-slate-700">
                            {note.authorInitials || note.authorName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{note.authorName}</span>
                          <span className="text-slate-400 uppercase text-[9px] font-mono">
                            • {note.authorRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 sm:p-4 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-between text-xs shrink-0">
            <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>CCEYA s. 8 & PIPEDA Role-Gated Storage • Audit Log Active</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
