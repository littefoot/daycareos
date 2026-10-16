import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  MessageSquare,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Tag,
  HelpCircle,
  History,
  Layers,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Save,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Archive,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { CuratedClientNote } from '../../types';
import { formatMessageTimestamp } from '../../utils/timeUtils';
import { 
  SupplementalBacklogDoc, 
  SupplementalTodoItem,
  generateSupplementalMarkdown
} from '../../services/supplementalTodoService';
import { PROJECT_DOCS } from '../../data/projectDocsContext';

export interface ChatMessageRecordForNotes {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  formAction?: any;
}

interface ClientNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageRecordForNotes[];
  curatedNotes?: CuratedClientNote[];
  supplementalBacklog: SupplementalBacklogDoc;
  onUpdateSupplementalBacklog: (newDoc: SupplementalBacklogDoc) => Promise<void>;
  onAppendSupplementalTask: (task: {
    title: string;
    description: string;
    category?: 'pipeline' | 'provider' | 'visitor' | 'compliance' | 'admin' | 'ai' | 'general';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    acceptanceCriteria?: string[];
  }) => Promise<void>;
  onCreateNote?: (note: CuratedClientNote) => void;
  onUpdateNote?: (note: CuratedClientNote) => void;
  onDeleteNote?: (noteId: string) => void;
}

export const ClientNotesModal: React.FC<ClientNotesModalProps> = ({
  isOpen,
  onClose,
  messages,
  curatedNotes = [],
  supplementalBacklog,
  onUpdateSupplementalBacklog,
  onAppendSupplementalTask,
  onCreateNote,
  onUpdateNote,
  onDeleteNote
}) => {
  const [activeTab, setActiveTab] = useState<'todo_supp' | 'project_docs' | 'legacy_notes' | 'raw_chat'>('todo_supp');
  const [activeDocSubTab, setActiveDocSubTab] = useState<'agents' | 'todo' | 'readme'>('todo');
  const [copiedTodoMd, setCopiedTodoMd] = useState(false);
  const [copiedRawTranscript, setCopiedRawTranscript] = useState(false);

  // Whole Document Markdown Editor State
  const [isEditingWholeDoc, setIsEditingWholeDoc] = useState(false);
  const [wholeDocMarkdown, setWholeDocMarkdown] = useState(supplementalBacklog.markdownContent);
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  // New Task Inline Form State
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState<'pipeline' | 'provider' | 'visitor' | 'compliance' | 'admin' | 'ai' | 'general'>('general');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskCriteria, setTaskCriteria] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Sync wholeDocMarkdown whenever supplementalBacklog changes externally (and user is not editing)
  useEffect(() => {
    if (!isEditingWholeDoc) {
      setWholeDocMarkdown(supplementalBacklog.markdownContent);
    }
  }, [supplementalBacklog, isEditingWholeDoc]);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditingWholeDoc) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isEditingWholeDoc]);

  if (!isOpen) return null;

  const rawUserPrompts = messages.filter(m => m.sender === 'user' && m.text.trim().length > 0);

  // 1-Click Copy for TODO.md
  const handleCopyForTodoMd = async () => {
    try {
      await navigator.clipboard.writeText(supplementalBacklog.markdownContent);
      setCopiedTodoMd(true);
      setTimeout(() => setCopiedTodoMd(false), 2500);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  // Download Markdown file
  const handleDownloadSupplementalMd = () => {
    const blob = new Blob([supplementalBacklog.markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ACCS_TODO_SUPPLEMENTAL_v${supplementalBacklog.version || 1}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save whole document changes back to Firestore
  const handleSaveWholeDoc = async () => {
    setIsSavingDoc(true);
    try {
      const updatedDoc: SupplementalBacklogDoc = {
        ...supplementalBacklog,
        markdownContent: wholeDocMarkdown,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Agency Director (Direct Editor)',
        version: (supplementalBacklog.version || 1) + 1
      };
      await onUpdateSupplementalBacklog(updatedDoc);
      setIsEditingWholeDoc(false);
    } catch (e) {
      console.error('Failed to save supplemental doc:', e);
    } finally {
      setIsSavingDoc(false);
    }
  };

  // Handle adding a new task
  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || isSubmittingTask) return;

    setIsSubmittingTask(true);
    try {
      const criteriaList = taskCriteria
        .split('\n')
        .map(line => line.trim().replace(/^[-*•\d.]\s*/, ''))
        .filter(line => line.length > 0);

      await onAppendSupplementalTask({
        title: taskTitle.trim(),
        description: taskDesc.trim() || taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        acceptanceCriteria: criteriaList.length > 0 ? criteriaList : [
          'Verify requirement matches client directive.',
          'Synthesize into C:\\Projects\\daycare-os\\TODO.md in next local dev cycle.'
        ]
      });

      setTaskTitle('');
      setTaskDesc('');
      setTaskCriteria('');
      setIsAddingTask(false);
    } catch (err) {
      console.error('Failed to append task:', err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Urgent', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'high':
        return { label: 'High', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'medium':
        return { label: 'Medium', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      default:
        return { label: 'Low', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'pipeline':
        return { label: 'Admissions Pipeline', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'provider':
        return { label: 'Provider Hub & Ratios', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'visitor':
        return { label: 'Home Visitor & CCEYA', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'compliance':
        return { label: 'Forms & Compliance', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'admin':
        return { label: 'Admin Command', bg: 'bg-orange-100 text-orange-950 border-orange-300' };
      case 'ai':
        return { label: 'AI Assistant & Copilot', bg: 'bg-indigo-100 text-indigo-950 border-indigo-300' };
      default:
        return { label: 'General / Platform', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && !isEditingWholeDoc) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-notes-modal-title"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b-2 border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6900] border border-orange-400 flex items-center justify-center text-white shadow-sm shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="client-notes-modal-title" className="text-base font-black tracking-tight text-white">
                  ACCS Requirements Backlog & System Ground Truth
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>todo_supp/active</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Single atomic backlog document in Cloud Firestore • Pre-formatted for merging into <code className="text-orange-300 font-mono">TODO.md</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('todo_supp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'todo_supp'
                  ? 'bg-orange-500 text-white shadow-neo-sm border-2 border-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Supplemental Backlog ({supplementalBacklog.tasks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('project_docs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'project_docs'
                  ? 'bg-slate-900 text-white shadow-neo-sm border-2 border-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Repository Ground Truth (3 Docs)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('legacy_notes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'legacy_notes'
                  ? 'bg-slate-900 text-white shadow-neo-sm border-2 border-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-500" />
              <span>Legacy Archive ({curatedNotes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('raw_chat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'raw_chat'
                  ? 'bg-slate-900 text-white shadow-neo-sm border-2 border-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Raw Chat ({rawUserPrompts.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px]">Version v{supplementalBacklog.version || 1}</span>
          </div>
        </div>

        {/* TAB 1: Supplemental TODO Backlog (Single Document in todo_supp/active) */}
        {activeTab === 'todo_supp' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70">
            {/* Toolbar */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyForTodoMd}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 border border-emerald-700 shadow-sm transition-all cursor-pointer active:scale-95"
                  title="Copy formatted markdown to clipboard for pasting into TODO.md"
                >
                  {copiedTodoMd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTodoMd ? 'Copied for TODO.md!' : '📋 Copy for TODO.md'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingWholeDoc(!isEditingWholeDoc)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isEditingWholeDoc 
                      ? 'bg-amber-100 text-amber-950 border-amber-300' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                  title="Edit the entire markdown backlog document directly"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingWholeDoc ? 'View Structured Tasks' : 'Edit Whole Markdown'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-orange-600 shadow-sm transition-all cursor-pointer"
                  title="Append a new task item to the supplemental backlog"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSupplementalMd}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                  title="Download ACCS_TODO_SUPPLEMENTAL.md file"
                >
                  <Download className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  Updated: {new Date(supplementalBacklog.lastUpdated).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Inline Add Task Form */}
            {isAddingTask && (
              <form onSubmit={handleAddTaskSubmit} className="p-4 bg-orange-50/70 border-b-2 border-orange-200 space-y-3 shrink-0 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-orange-600" />
                    <span>Append Task to Unified Supplemental Backlog</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Task Title *</label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Export entire Firestore database as JSON backup"
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Category</label>
                    <select
                      value={taskCategory}
                      onChange={(e: any) => setTaskCategory(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="pipeline">Admissions Pipeline</option>
                      <option value="provider">Provider Hub & Ratios</option>
                      <option value="visitor">Home Visitor & CCEYA</option>
                      <option value="compliance">Forms & Compliance</option>
                      <option value="admin">Admin Command</option>
                      <option value="ai">AI Assistant & Copilot</option>
                      <option value="general">General / Platform</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Problem / Requirement Description</label>
                    <textarea
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      rows={2}
                      placeholder="Explain the operational rationale and expected behavior..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e: any) => setTaskPriority(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="urgent">🚨 Urgent (Immediate Blocker)</option>
                      <option value="high">🔥 High (Next Local Dev Sprint)</option>
                      <option value="medium">⚡ Medium (Standard Enhancement)</option>
                      <option value="low">📝 Low (Nice to have)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Acceptance Criteria (1 per line)</label>
                  <textarea
                    value={taskCriteria}
                    onChange={(e) => setTaskCriteria(e.target.value)}
                    rows={2}
                    placeholder="1. Admin clicks button in Settings&#10;2. Downloads full JSON package&#10;3. Preserves Montreal Canadian data sovereignty"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingTask || !taskTitle.trim()}
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl border border-orange-700 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingTask ? 'Saving to Firestore...' : 'Append to Backlog'}
                  </button>
                </div>
              </form>
            )}

            {/* Whole Document Markdown Editor Mode */}
            {isEditingWholeDoc ? (
              <div className="flex-1 p-4 flex flex-col min-h-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Edit2 className="w-4 h-4 text-orange-600" />
                    <span>Raw Markdown Document Editor (<code className="font-mono text-orange-600">todo_supp/active</code>)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWholeDocMarkdown(supplementalBacklog.markdownContent);
                        setIsEditingWholeDoc(false);
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 border border-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveWholeDoc}
                      disabled={isSavingDoc}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl border border-emerald-700 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingDoc ? 'Saving...' : 'Save Changes to Firestore'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={wholeDocMarkdown}
                  onChange={(e) => setWholeDocMarkdown(e.target.value)}
                  className="flex-1 w-full p-4 font-mono text-xs text-slate-800 bg-white border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-orange-500 shadow-inner resize-none leading-relaxed"
                  placeholder="# Supplemental Requirements Backlog..."
                />
              </div>
            ) : (
              /* Structured Tasks & Markdown Preview */
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Integration Protocol Banner */}
                <div className="p-3.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1 text-orange-950">
                    <span className="font-black flex items-center gap-1.5 text-orange-900">
                      <FolderGit2 className="w-4 h-4 text-orange-600" />
                      <span>Single-File Supplemental Protocol</span>
                    </span>
                    <p className="text-[11px] text-orange-900/90 leading-relaxed">
                      All new client review notes and requirements are accumulated in this single document (<code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-orange-300 text-orange-800">todo_supp/active</code>). During the next round of local development, click <strong>"📋 Copy for TODO.md"</strong> to merge these deliverables directly into <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-orange-300 text-orange-800">C:\Projects\allchildcaresolutions\TODO.md</code>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyForTodoMd}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-[11px] rounded-xl border border-orange-700 shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTodoMd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTodoMd ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-orange-600" />
                      <span>Active Supplemental Items ({supplementalBacklog.tasks.length})</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Collection: todo_supp</span>
                  </div>

                  {supplementalBacklog.tasks.length === 0 ? (
                    <div className="p-8 text-center bg-white border-2 border-dashed border-slate-300 rounded-2xl space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-600 mx-auto">
                        <Bookmark className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900">No Supplemental Items Yet</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Share any operational requirement or feature request in the AI Assistant, or click <strong>"Add Task"</strong> above to record requirements in this single unified document.
                      </p>
                    </div>
                  ) : (
                    supplementalBacklog.tasks.map((task, idx) => {
                      const pBadge = getPriorityBadge(task.priority);
                      const cBadge = getCategoryBadge(task.category);

                      return (
                        <div 
                          key={task.id || idx}
                          className="p-4 bg-white border-2 border-slate-200 hover:border-slate-400 rounded-2xl space-y-2.5 shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg">
                                  #{idx + 1}
                                </span>
                                <h4 className="text-sm font-black text-slate-900">{task.title}</h4>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${pBadge.bg}`}>
                                  {pBadge.label}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${cBadge.bg}`}>
                                  {cBadge.label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {task.createdAt?.split('T')[0] || 'Today'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {task.description}
                          </p>

                          {task.originalUserPrompt && (
                            <p className="text-[11px] text-slate-500 italic">
                              <span className="font-semibold text-slate-600 not-italic">Original prompt: </span>
                              "{task.originalUserPrompt}"
                            </p>
                          )}

                          {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                                Acceptance Criteria
                              </span>
                              <div className="space-y-1">
                                {task.acceptanceCriteria.map((crit, cIdx) => (
                                  <div key={cIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{crit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Formatted Markdown Preview Drawer */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>Markdown Preview for TODO.md</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyForTodoMd}
                      className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy snippet</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                    {supplementalBacklog.markdownContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Project Ground Truth (AGENTS.md, TODO.md, README.md) */}
        {activeTab === 'project_docs' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70">
            {/* Sub-tab navigation */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveDocSubTab('todo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDocSubTab === 'todo'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  TODO.md (33 Tasks Completed)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocSubTab('agents')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDocSubTab === 'agents'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  AGENTS.md (CCEYA & Air-Gap Rules)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocSubTab('readme')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDocSubTab === 'readme'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  README.md (Architecture Manual)
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                {activeDocSubTab === 'todo' && `${PROJECT_DOCS.todoMd.split('\n').length} lines`}
                {activeDocSubTab === 'agents' && `${PROJECT_DOCS.agentsMd.split('\n').length} lines`}
                {activeDocSubTab === 'readme' && `${PROJECT_DOCS.readmeMd.split('\n').length} lines`}
              </div>
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  The ACCS in-app AI Assistant has direct read access to this local file via Vite raw bundling.
                </span>
              </div>

              <pre className="p-4 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-800 font-mono overflow-x-auto leading-relaxed shadow-sm whitespace-pre-wrap">
                {activeDocSubTab === 'todo' && PROJECT_DOCS.todoMd}
                {activeDocSubTab === 'agents' && PROJECT_DOCS.agentsMd}
                {activeDocSubTab === 'readme' && PROJECT_DOCS.readmeMd}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: Legacy Developer Notes Archive */}
        {activeTab === 'legacy_notes' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/70">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Legacy developer_notes Collection ({curatedNotes.length} Items):</strong> Preserved intact in Cloud Firestore for historical reference. New requirements are routed to <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">todo_supp/active</code>.
                </span>
              </div>
            </div>

            {curatedNotes.length === 0 ? (
              <div className="p-8 text-center bg-white border-2 border-dashed border-slate-300 rounded-2xl space-y-2">
                <Archive className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">No legacy notes found in storage.</p>
              </div>
            ) : (
              curatedNotes.map((note, idx) => (
                <div key={note.id || idx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-sm text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{note.topic}</span>
                    <span className="text-[10px] font-mono text-slate-400">{note.id}</span>
                  </div>
                  <p className="text-slate-600 leading-snug">{note.summary}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: Raw Chat Transcript */}
        {activeTab === 'raw_chat' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Total Turns: {messages.length}</span>
              <button
                type="button"
                onClick={() => {
                  const text = messages.map(m => `[${formatMessageTimestamp(m.timestamp)}] ${m.sender}: ${m.text}`).join('\n\n');
                  navigator.clipboard.writeText(text);
                  setCopiedRawTranscript(true);
                  setTimeout(() => setCopiedRawTranscript(false), 2000);
                }}
                className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedRawTranscript ? 'Copied Transcript!' : 'Copy Transcript'}</span>
              </button>
            </div>

            {messages.map((m) => (
              <div 
                key={m.id}
                className={`p-3 rounded-2xl text-xs space-y-1 border ${
                  m.sender === 'user' 
                    ? 'bg-orange-50 border-orange-200 text-orange-950 ml-6' 
                    : 'bg-white border-slate-200 text-slate-800 mr-6 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-70">
                  <span className="font-bold uppercase">{m.sender === 'user' ? 'Client' : 'ACCS AI Copilot'}</span>
                  <span>{formatMessageTimestamp(m.timestamp)}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">Cloud Database: Montreal (northamerica-northeast1)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyForTodoMd}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedTodoMd ? 'Copied!' : 'Copy for TODO.md'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
