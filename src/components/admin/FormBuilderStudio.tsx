import React, { useState, useEffect } from 'react';
import { FormTemplate, FormField, FieldType, FormSection, FormVersionRecord } from '../../types/formSchema';
import { ModalPortal } from '../common/ModalPortal';
import { 
  AS_NEEDED_DOCUMENT_TEMPLATES, 
  AsNeededDocumentTemplate, 
  AsNeededCategory 
} from '../../data/asNeededFormsData';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Save, 
  FileText, 
  Layers, 
  Download, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  ArrowLeft, 
  ShieldCheck,
  AlertCircle,
  Copy,
  PenTool,
  Calendar,
  Check,
  Users,
  Home,
  Tag,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  X,
  History,
  RotateCcw,
  Clock,
  GitBranch,
  FolderDown,
  ExternalLink,
  Send,
  Search,
  Filter
} from 'lucide-react';
import { deleteFormTemplateFromFirestore } from '../../services/firebaseService';

interface FormBuilderStudioProps {
  forms: FormTemplate[];
  initialSelectedFormId?: string | null;
  onSaveForms: (forms: FormTemplate[]) => void;
  onSaveSingleForm?: (form: FormTemplate, changeSummary: string, author?: string) => Promise<any>;
  onRollbackForm?: (formId: string, versionRecord: FormVersionRecord) => Promise<any>;
  onResetFormToFactory?: (formId: string) => Promise<any>;
  onFetchFormVersions?: (formId: string) => Promise<FormVersionRecord[]>;
  onOpenDocumentBin?: () => void;
  onOpenDispatchModal?: (templateId: string, childId?: string) => void;
}

export const FormBuilderStudio: React.FC<FormBuilderStudioProps> = ({
  forms,
  initialSelectedFormId,
  onSaveForms,
  onSaveSingleForm,
  onRollbackForm,
  onResetFormToFactory,
  onFetchFormVersions,
  onOpenDocumentBin,
  onOpenDispatchModal
}) => {
  const [formList, setFormList] = useState<FormTemplate[]>(forms);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(initialSelectedFormId || null);
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'parent' | 'provider' | 'visitor' | 'supplemental' | 'as-needed'>('all');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor');

  // Search & Filter State for As-Needed Documents Tab
  const [asNeededSearchTerm, setAsNeededSearchTerm] = useState('');
  const [asNeededCategoryFilter, setAsNeededCategoryFilter] = useState<string>('all');
  const [copiedAsNeededId, setCopiedAsNeededId] = useState<string | null>(null);

  const handleCopyAsNeededLink = (doc: AsNeededDocumentTemplate, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}${doc.pdfUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedAsNeededId(doc.id);
    setTimeout(() => setCopiedAsNeededId(null), 2500);
  };

  // Keep formList synchronized with upstream forms state
  useEffect(() => {
    setFormList(forms);
  }, [forms]);

  // Keep selectedFormId synchronized when an initialSelectedFormId is passed
  useEffect(() => {
    if (initialSelectedFormId) {
      setSelectedFormId(initialSelectedFormId);
    }
  }, [initialSelectedFormId]);

  // Version Control & Rollback Drawer State
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<FormVersionRecord[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isFactoryResetModalOpen, setIsFactoryResetModalOpen] = useState(false);
  const [isRollbackConfirmOpen, setIsRollbackConfirmOpen] = useState(false);
  const [pendingRollbackVersion, setPendingRollbackVersion] = useState<FormVersionRecord | null>(null);
  const [versionActionNotice, setVersionActionNotice] = useState<string | null>(null);
  const [isPerformingVersionAction, setIsPerformingVersionAction] = useState(false);
  
  // Field Editor State
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldHelpText, setNewFieldHelpText] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldGridCols, setNewFieldGridCols] = useState<1 | 2 | 3>(2);

  // Active Field In-Line Editing State
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState<FieldType>('text');
  const [editPlaceholder, setEditPlaceholder] = useState('');
  const [editHelpText, setEditHelpText] = useState('');
  const [editRequired, setEditRequired] = useState(true);
  const [editOptions, setEditOptions] = useState('');
  const [editGridCols, setEditGridCols] = useState<1 | 2 | 3>(2);

  // New Form Creation State
  const [newFormAudience, setNewFormAudience] = useState<'parent' | 'provider' | 'visitor' | 'supplemental'>('parent');

  const [saveBanner, setSaveBanner] = useState(false);

  const currentForm = formList.find(f => f.id === selectedFormId) || null;

  const triggerSave = (updated: FormTemplate[], changeSummary: string = 'Updated form schema via Studio') => {
    setFormList(updated);
    onSaveForms(updated);
    if (currentForm && onSaveSingleForm) {
      const updatedCurrent = updated.find(f => f.id === currentForm.id);
      if (updatedCurrent) {
        onSaveSingleForm(updatedCurrent, changeSummary, 'Agency Director (Admin Studio)');
      }
    }
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleOpenVersionHistory = async () => {
    if (!currentForm) return;
    setIsVersionDrawerOpen(true);
    setIsLoadingVersions(true);
    if (onFetchFormVersions) {
      try {
        const history = await onFetchFormVersions(currentForm.id);
        setVersionHistory(history);
      } catch (err) {
        console.error('Failed to load version history:', err);
      }
    }
    setIsLoadingVersions(false);
  };

  const handleConfirmRollback = async () => {
    if (!currentForm || !pendingRollbackVersion || !onRollbackForm) return;
    setIsPerformingVersionAction(true);
    try {
      await onRollbackForm(currentForm.id, pendingRollbackVersion);
      setVersionActionNotice(`Form rolled back to Version ${pendingRollbackVersion.versionTag}!`);
      setIsRollbackConfirmOpen(false);
      setPendingRollbackVersion(null);
      setIsVersionDrawerOpen(false);
      setTimeout(() => setVersionActionNotice(null), 3500);
    } catch (err) {
      console.error('Rollback error:', err);
    } finally {
      setIsPerformingVersionAction(false);
    }
  };

  const handleConfirmFactoryReset = async () => {
    if (!currentForm || !onResetFormToFactory) return;
    setIsPerformingVersionAction(true);
    try {
      await onResetFormToFactory(currentForm.id);
      setVersionActionNotice(`Form ${currentForm.formCode} reset to pristine Factory Default.`);
      setIsFactoryResetModalOpen(false);
      setIsVersionDrawerOpen(false);
      setTimeout(() => setVersionActionNotice(null), 3500);
    } catch (err) {
      console.error('Factory reset error:', err);
    } finally {
      setIsPerformingVersionAction(false);
    }
  };

  // Start Editing a Field
  const handleStartEditField = (field: FormField) => {
    setEditingFieldId(field.id);
    setEditLabel(field.label);
    setEditType(field.type);
    setEditPlaceholder(field.placeholder || '');
    setEditHelpText(field.helpText || '');
    setEditRequired(field.required ?? true);
    setEditOptions(field.options?.join(', ') || '');
    setEditGridCols(field.gridCols || 2);
  };

  // Save Edited Field
  const handleSaveEditField = () => {
    if (!currentForm || !editingFieldId || !editLabel.trim()) return;

    const updatedSections = currentForm.sections.map(sec => ({
      ...sec,
      fields: sec.fields.map(f => {
        if (f.id !== editingFieldId) return f;
        return {
          ...f,
          label: editLabel.trim(),
          name: editLabel.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          type: editType,
          placeholder: editPlaceholder.trim() || undefined,
          helpText: editHelpText.trim() || undefined,
          required: editRequired,
          gridCols: editGridCols,
          options: (editType === 'dropdown' || editType === 'radio') 
            ? editOptions.split(',').map(s => s.trim()).filter(Boolean) 
            : undefined
        };
      })
    }));

    const updatedForm = { ...currentForm, sections: updatedSections, lastUpdated: new Date().toISOString().split('T')[0] };
    const updatedList = formList.map(f => f.id === currentForm.id ? updatedForm : f);
    triggerSave(updatedList);
    setEditingFieldId(null);
  };

  // Move Field Up or Down within a section
  const handleMoveField = (sectionId: string, index: number, direction: 'up' | 'down') => {
    if (!currentForm) return;

    const updatedSections = currentForm.sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sec.fields.length) return sec;

      const newFields = [...sec.fields];
      const temp = newFields[index];
      newFields[index] = newFields[targetIndex];
      newFields[targetIndex] = temp;
      return { ...sec, fields: newFields };
    });

    const updatedForm = { ...currentForm, sections: updatedSections, lastUpdated: new Date().toISOString().split('T')[0] };
    const updatedList = formList.map(f => f.id === currentForm.id ? updatedForm : f);
    triggerSave(updatedList);
  };

  // Move Entire Section Up or Down
  const handleMoveSection = (sectionIndex: number, direction: 'up' | 'down') => {
    if (!currentForm) return;
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentForm.sections.length) return;

    const newSections = [...currentForm.sections];
    const temp = newSections[sectionIndex];
    newSections[sectionIndex] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const updatedForm = { ...currentForm, sections: newSections, lastUpdated: new Date().toISOString().split('T')[0] };
    const updatedList = formList.map(f => f.id === currentForm.id ? updatedForm : f);
    triggerSave(updatedList);
  };

  // Category counts
  const parentFormsCount = formList.filter(f => f.assignedTo === 'parent' || f.assignedTo === 'both').length;
  const providerFormsCount = formList.filter(f => f.assignedTo === 'provider' || f.assignedTo === 'both').length;
  const visitorFormsCount = formList.filter(f => f.assignedTo === 'visitor').length;
  const supplementalFormsCount = formList.filter(f => f.assignedTo === 'supplemental' || f.category === 'Special Needs' || f.category === 'Compliance' || f.category === 'Operations' || f.id.startsWith('sup-')).length;
  const asNeededFormsCount = AS_NEEDED_DOCUMENT_TEMPLATES.length;

  // Filter forms by Audience
  const filteredForms = audienceFilter === 'all'
    ? formList
    : audienceFilter === 'parent'
    ? formList.filter(f => f.assignedTo === 'parent' || f.assignedTo === 'both')
    : audienceFilter === 'provider'
    ? formList.filter(f => f.assignedTo === 'provider' || f.assignedTo === 'both')
    : audienceFilter === 'visitor'
    ? formList.filter(f => f.assignedTo === 'visitor')
    : audienceFilter === 'supplemental'
    ? formList.filter(f => f.assignedTo === 'supplemental' || f.category === 'Special Needs' || f.category === 'Compliance' || f.category === 'Operations' || f.id.startsWith('sup-'))
    : [];

  // Filter As-Needed Documents
  const filteredAsNeededDocs = AS_NEEDED_DOCUMENT_TEMPLATES.filter(doc => {
    if (asNeededCategoryFilter !== 'all' && doc.category !== asNeededCategoryFilter) {
      return false;
    }
    if (asNeededSearchTerm.trim()) {
      const q = asNeededSearchTerm.toLowerCase();
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

  // Create New Form
  const handleCreateNewForm = () => {
    const audience = audienceFilter === 'all' ? newFormAudience : audienceFilter;
    const newFormId = audience === 'parent' 
      ? `par-form-${Date.now()}` 
      : audience === 'provider'
      ? `prov-form-${Date.now()}`
      : audience === 'visitor'
      ? `vis-form-${Date.now()}`
      : `sup-form-${Date.now()}`;

    const newFormCode = audience === 'parent' 
      ? `PAR-${parentFormsCount}` 
      : audience === 'provider'
      ? `PROV-${providerFormsCount}`
      : audience === 'visitor'
      ? `HV-${visitorFormsCount}`
      : `SUP-${supplementalFormsCount + 1}`;

    const newFormTitle = audience === 'parent' 
      ? 'New Parent Registration Form' 
      : audience === 'provider'
      ? 'New Provider Compliance Form'
      : audience === 'visitor'
      ? 'New Home Visitor Inspection Form'
      : 'New Ministry Supplemental / Special Needs Form';

    const newCategory: any = audience === 'parent' 
      ? 'Admissions' 
      : audience === 'provider'
      ? 'Safety'
      : audience === 'visitor'
      ? 'Inspection'
      : 'Compliance';

    const newForm: FormTemplate = {
      id: newFormId,
      formCode: newFormCode,
      title: newFormTitle,
      category: newCategory,
      description: `Custom ${audience} form added via Admin Form Builder.`,
      version: '2026.1',
      isRequired: true,
      targetStage: audience === 'parent' ? 'registration' : 'annual',
      assignedTo: (audience === 'parent' || audience === 'provider' || audience === 'visitor') ? audience : 'supplemental',
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: [
        {
          id: `sec-${Date.now()}`,
          title: 'General Information',
          description: 'Please complete all required fields.',
          fields: [
            { id: `f-${Date.now()}-1`, name: 'full_name', label: 'Full Legal Name', type: 'text', required: true, gridCols: 2 },
            { id: `f-${Date.now()}-2`, name: 'date', label: 'Date', type: 'date', required: true, gridCols: 2 }
          ]
        }
      ]
    };

    const updated = [...formList, newForm];
    triggerSave(updated);
    setSelectedFormId(newFormId);
    setActiveTab('editor');
  };

  // Delete Form
  const handleDeleteForm = (formId: string) => {
    if (formList.length <= 1) return;
    const updated = formList.filter(f => f.id !== formId);
    triggerSave(updated);
    deleteFormTemplateFromFirestore(formId).catch(err => console.warn('Delete form error:', err));
    if (selectedFormId === formId) {
      setSelectedFormId(null);
    }
  };

  // Add Field to Current Form
  const handleAddField = () => {
    if (!currentForm || !newFieldLabel.trim()) return;

    const newField: FormField = {
      id: `f-${Date.now()}`,
      name: newFieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      label: newFieldLabel,
      type: newFieldType,
      placeholder: newFieldPlaceholder,
      helpText: newFieldHelpText,
      required: newFieldRequired,
      gridCols: newFieldGridCols,
      options: (newFieldType === 'dropdown' || newFieldType === 'radio') 
        ? newFieldOptions.split(',').map(s => s.trim()).filter(Boolean) 
        : undefined
    };

    const updatedSections = currentForm.sections.map((sec, idx) => {
      if (idx === 0) {
        return { ...sec, fields: [...sec.fields, newField] };
      }
      return sec;
    });

    const updatedForm = { ...currentForm, sections: updatedSections, lastUpdated: new Date().toISOString().split('T')[0] };
    const updatedList = formList.map(f => f.id === currentForm.id ? updatedForm : f);

    triggerSave(updatedList);

    // Reset inputs
    setNewFieldLabel('');
    setNewFieldPlaceholder('');
    setNewFieldHelpText('');
    setNewFieldOptions('');
    setIsAddingField(false);
  };

  // Delete Field
  const handleDeleteField = (fieldId: string) => {
    if (!currentForm) return;
    const updatedSections = currentForm.sections.map(sec => ({
      ...sec,
      fields: sec.fields.filter(f => f.id !== fieldId)
    }));

    const updatedForm = { ...currentForm, sections: updatedSections, lastUpdated: new Date().toISOString().split('T')[0] };
    const updatedList = formList.map(f => f.id === currentForm.id ? updatedForm : f);
    triggerSave(updatedList);
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `accs_all_forms_schema_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header & High-Level Form Directory Controls */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-extrabold text-slate-900">Dynamic Agency Form Builder Studio</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Parent & Provider Segregated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage, customize, and deploy regulatory forms. Separate parent intake applications from child care provider compliance and home inspection forms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveBanner && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Schemas Saved</span>
            </span>
          )}

          <button
            onClick={handleExportJson}
            className="neo-btn bg-white hover:bg-slate-100 text-slate-800 px-3 py-2 text-xs font-bold gap-1.5"
            title="Download JSON schema files"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleCreateNewForm}
            className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 text-xs font-bold gap-1.5 shadow-neo-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New {audienceFilter === 'all' ? 'Agency' : audienceFilter === 'parent' ? 'Parent' : audienceFilter === 'provider' ? 'Provider' : audienceFilter === 'visitor' ? 'Visitor' : 'Ministry'} Form</span>
          </button>
        </div>
      </div>

      {/* Main Studio View: Form Directory Grid or Active Form Studio */}
      {!currentForm ? (
        <div className="space-y-4">
          {/* Distinct Category & Audience Segregation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-900">
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setAudienceFilter('all')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  audienceFilter === 'all'
                    ? 'bg-slate-900 text-white border-2 border-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-orange-400" />
                <span>All Forms</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  audienceFilter === 'all' ? 'bg-slate-800 text-orange-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {formList.length + asNeededFormsCount}
                </span>
              </button>

              <button
                onClick={() => setAudienceFilter('parent')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  audienceFilter === 'parent'
                    ? 'bg-emerald-600 text-white border-2 border-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Parent Forms</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  audienceFilter === 'parent' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {parentFormsCount}
                </span>
              </button>

              <button
                onClick={() => setAudienceFilter('provider')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  audienceFilter === 'provider'
                    ? 'bg-amber-500 text-slate-900 border-2 border-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Provider Forms</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  audienceFilter === 'provider' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {providerFormsCount}
                </span>
              </button>

              <button
                onClick={() => setAudienceFilter('visitor')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  audienceFilter === 'visitor'
                    ? 'bg-purple-600 text-white border-2 border-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Home Visitor Field Forms</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  audienceFilter === 'visitor' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {visitorFormsCount}
                </span>
              </button>

              <button
                onClick={() => setAudienceFilter('supplemental')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  audienceFilter === 'supplemental'
                    ? 'bg-blue-600 text-white border-2 border-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Ministry & Supplemental</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  audienceFilter === 'supplemental' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {supplementalFormsCount}
                </span>
              </button>

              <button
                onClick={() => setAudienceFilter('as-needed')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  audienceFilter === 'as-needed'
                    ? 'bg-amber-500 text-slate-900 border-2 border-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <FolderDown className="w-4 h-4 text-amber-900" />
                <span>As-Needed Bin</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  audienceFilter === 'as-needed' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {asNeededFormsCount}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 px-2 flex-wrap justify-between sm:justify-end">
              <div className="text-xs text-slate-500 font-semibold">
                Showing: <strong className="text-slate-900">{
                  audienceFilter === 'parent' ? 'Parent & Guardian Forms' :
                  audienceFilter === 'provider' ? 'Child Care Provider Forms' :
                  audienceFilter === 'visitor' ? 'Home Visitor Field Inspection Forms' :
                  audienceFilter === 'supplemental' ? 'Ministry Supplemental & Special Needs Forms' :
                  audienceFilter === 'as-needed' ? 'As-Needed Bin & Blank PDF Templates (13 Documents)' :
                  'All Agency Forms'
                }</strong>
              </div>

              {onOpenDocumentBin && (
                <button
                  type="button"
                  onClick={onOpenDocumentBin}
                  className="neo-btn bg-amber-50 hover:bg-amber-100 text-amber-950 border-2 border-slate-900 px-3 py-1.5 text-xs font-black gap-1.5 shadow-neo-sm cursor-pointer"
                  title="Open As-Needed Agency Forms & Blank PDF Templates (13 Templates)"
                >
                  <FolderDown className="w-3.5 h-3.5 text-amber-600" />
                  <span>As-Needed Document Bin (13)</span>
                </button>
              )}
            </div>
          </div>

          {/* If As-Needed Bin is selected, render the dedicated 13-document As-Needed Bin suite */}
          <div className="flex flex-col gap-6">
          {(audienceFilter === 'as-needed' || audienceFilter === 'all') && (
            <div className="space-y-4 order-2">
              {/* As-Needed Bin Filter & Search Bar */}
              <div className="bg-amber-50 border-2 border-slate-900 rounded-2xl p-4 shadow-neo-sm space-y-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FolderDown className="w-5 h-5 text-amber-700" />
                      <h3 className="text-sm font-black text-slate-900">
                        As-Needed Agency Forms & Blank PDF Templates ({filteredAsNeededDocs.length} of {asNeededFormsCount})
                      </h3>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-400">
                        Official CCEYA & Ministry Bin
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Statutory affidavits, individualized support plans (ISP), medical consents, serious occurrence logs, and program schedules ready for direct distribution or digital schema editing.
                    </p>
                  </div>

                  {onOpenDocumentBin && (
                    <button
                      type="button"
                      onClick={onOpenDocumentBin}
                      className="neo-btn bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 text-xs font-bold gap-1.5 shadow-neo-sm shrink-0 cursor-pointer"
                      title="Open full As-Needed Distribution Modal"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-700" />
                      <span>Open Full Distribution Hub</span>
                    </button>
                  )}
                </div>

                {/* Search & Category Filter Controls */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-amber-200/60">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={asNeededSearchTerm}
                      onChange={(e) => setAsNeededSearchTerm(e.target.value)}
                      placeholder="Search by title, code (e.g. SUP-4A, PROV-WPP), tag, or keyword..."
                      className="w-full pl-8 pr-8 py-1.5 bg-white border-2 border-slate-900 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder:text-slate-400 shadow-xs"
                    />
                    {asNeededSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setAsNeededSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none py-0.5">
                    {[
                      { id: 'all', label: 'All Categories' },
                      { id: 'Statutory Exemption', label: 'Statutory Exemption (2)' },
                      { id: 'Special Needs & Inclusion', label: 'Special Needs & ISP (2)' },
                      { id: 'Operations & Safety', label: 'Operations & Safety (3)' },
                      { id: 'Provider Operations', label: 'Provider Operations (4)' },
                      { id: 'Curriculum & Pedagogy', label: 'Curriculum (2)' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setAsNeededCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                          asNeededCategoryFilter === cat.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* As-Needed Document Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAsNeededDocs.map(doc => {
                  const linkedDigitalForm = doc.digitalFormId ? formList.find(f => f.id === doc.digitalFormId) : null;
                  const totalFields = linkedDigitalForm?.sections.reduce((acc, sec) => acc + sec.fields.length, 0) || 0;

                  return (
                    <div
                      key={doc.id}
                      className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-neo-sm hover:shadow-neo transition-all flex flex-col justify-between hover:border-amber-600 group"
                    >
                      <div>
                        {/* Top Metadata Badges */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md border bg-amber-100 text-amber-950 border-amber-400">
                              {doc.formCode}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              doc.targetAudience === 'parent'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : doc.targetAudience === 'provider'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-blue-100 text-blue-900 border-blue-300'
                            }`}>
                              {doc.targetAudience === 'parent' ? 'Parent' : doc.targetAudience === 'provider' ? 'Provider' : 'Parent & Provider'}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {doc.category}
                          </span>
                        </div>

                        {/* Title & Statutory Reference */}
                        <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-amber-950 transition-colors">
                          {doc.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-700">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{doc.statutoryReference}</span>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                          {doc.description}
                        </p>

                        {/* Default Dispatch Notes Callout */}
                        {doc.defaultNotes && (
                          <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 italic">
                            <span className="font-bold not-italic text-slate-700">Note: </span>
                            {doc.defaultNotes}
                          </div>
                        )}

                        {/* File Format & Digital Schema Status */}
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1 font-mono">
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>PDF • {doc.fileSizeFormatted}</span>
                          </span>

                          {linkedDigitalForm ? (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Digital Form ({totalFields} Fields)</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              Official Document
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {doc.tags.slice(0, 4).map((tag, tidx) => (
                              <span key={tidx} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {linkedDigitalForm && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFormId(linkedDigitalForm.id);
                                setActiveTab('editor');
                              }}
                              className="neo-btn bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 text-xs font-bold gap-1 shadow-neo-sm cursor-pointer"
                              title="Customize digital form schema, sections & fields in Form Builder Studio"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Schema</span>
                            </button>
                          )}

                          <a
                            href={doc.pdfUrl}
                            download={doc.fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="neo-btn bg-white hover:bg-slate-100 text-slate-800 px-2.5 py-1.5 text-xs font-bold gap-1 shadow-xs cursor-pointer"
                            title="Open / download blank official PDF template"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                            <span>PDF</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => handleCopyAsNeededLink(doc, e)}
                            className="neo-btn bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 text-xs font-bold gap-1 shadow-xs cursor-pointer"
                            title="Copy link to clipboard"
                          >
                            {copiedAsNeededId === doc.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600" />
                                <span>Link</span>
                              </>
                            )}
                          </button>
                        </div>

                        {onOpenDispatchModal && (
                          <button
                            type="button"
                            onClick={() => onOpenDispatchModal(doc.id)}
                            className="neo-btn bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold gap-1 shadow-neo-sm cursor-pointer ml-auto"
                            title="Dispatch this form to a registered family or provider"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAsNeededDocs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-slate-900 border-dashed p-8">
                  <FolderDown className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">No as-needed templates match your search</h4>
                  <p className="text-xs text-slate-500 mt-1">Try adjusting your keywords or category filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAsNeededSearchTerm('');
                      setAsNeededCategoryFilter('all');
                    }}
                    className="mt-3 text-xs font-bold text-orange-600 hover:underline"
                  >
                    Clear Search Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Regular Digital Form Schema Grid (hidden only on As-Needed tab) */}
          {audienceFilter !== 'as-needed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 order-1">
              {filteredForms.map(form => {
                const totalFields = form.sections.reduce((acc, sec) => acc + sec.fields.length, 0);
                const isProviderForm = form.assignedTo === 'provider';
                const isVisitorForm = form.assignedTo === 'visitor';
                const isSupplementalForm = form.assignedTo === 'supplemental' || form.category === 'Special Needs' || form.category === 'Compliance' || form.category === 'Operations' || form.id.startsWith('sup-');
                const isAsNeededForm = AS_NEEDED_DOCUMENT_TEMPLATES.some(
                  d => d.digitalFormId === form.id || d.formCode === form.formCode
                );

                const audienceLabel = isVisitorForm
                  ? 'Home Visitor'
                  : isSupplementalForm
                  ? 'Ministry / Special'
                  : isProviderForm
                  ? 'Provider'
                  : 'Parent';

                const badgeColor = isVisitorForm
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : isSupplementalForm
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : isProviderForm
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300';

                const hoverBorder = isVisitorForm
                  ? 'hover:border-purple-500'
                  : isSupplementalForm
                  ? 'hover:border-blue-500'
                  : isProviderForm
                  ? 'hover:border-amber-500'
                  : 'hover:border-emerald-500';

                return (
                  <div
                    key={form.id}
                    onClick={() => {
                      setSelectedFormId(form.id);
                      setActiveTab('editor');
                    }}
                    className={`bg-white border-2 border-slate-900 rounded-2xl p-5 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between ${hoverBorder}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            {form.formCode}
                          </span>

                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {audienceLabel}
                          </span>

                          {isAsNeededForm && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <FolderDown className="w-3 h-3 text-amber-700" />
                              <span>As-Needed</span>
                            </span>
                          )}
                        </div>

                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          form.category === 'Legal & Agreement' ? 'bg-purple-100 text-purple-800' :
                          form.category === 'Medical' ? 'bg-red-100 text-red-800' :
                          form.category === 'Emergency' ? 'bg-amber-100 text-amber-800' :
                          form.category === 'Special Needs' ? 'bg-indigo-100 text-indigo-800' :
                          form.category === 'Inspection' ? 'bg-cyan-100 text-cyan-800' :
                          form.category === 'Compliance' ? 'bg-emerald-100 text-emerald-800' :
                          form.category === 'Operations' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {form.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{form.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{form.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>{totalFields} Fields</span>
                        <span>•</span>
                        <span>v{form.version}</span>
                      </div>

                      <button className={`font-bold hover:underline flex items-center gap-1 ${
                        isVisitorForm ? 'text-purple-700' : isSupplementalForm ? 'text-blue-700' : isProviderForm ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        <span>Edit Form</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      ) : (
        /* Active Form Editor & Live Preview Studio */
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 space-y-6">
          {/* Editor Header Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFormId(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700"
                title="Back to all forms"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    currentForm.assignedTo === 'provider' ? 'bg-amber-500 text-slate-900' : 'bg-emerald-600 text-white'
                  }`}>
                    {currentForm.formCode} ({currentForm.assignedTo === 'provider' ? 'Provider Form' : 'Parent Form'})
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">{currentForm.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentForm.description}</p>
              </div>
            </div>

            {/* View Mode & Version Control Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'editor' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Visual Editor</span>
                </button>

                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'preview' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{currentForm.assignedTo === 'provider' ? 'Provider Preview' : 'Parent Preview'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('json')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'json' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>

              {/* Version History Button */}
              <button
                onClick={handleOpenVersionHistory}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold border-2 border-slate-900 shadow-neo-sm hover:shadow-neo transition-all active:translate-x-0.5 active:translate-y-0.5"
                title="View version control history and rollback snapshots"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>History ({currentForm.version || 'v1.0'})</span>
              </button>

              {/* Factory Reset Button */}
              <button
                onClick={() => setIsFactoryResetModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-bold border-2 border-rose-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
                title="Reset to Ontario CCEYA factory default baseline"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          {/* Action Notification Banner */}
          {versionActionNotice && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-xs font-bold text-emerald-950 flex items-center justify-between shadow-neo-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{versionActionNotice}</span>
              </div>
              <button onClick={() => setVersionActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5">✕</button>
            </div>
          )}

          {/* TAB 1: VISUAL FIELD EDITOR */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* Form Metadata Settings Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">Form Title</label>
                  <input
                    type="text"
                    value={currentForm.title}
                    onChange={(e) => {
                      const updated = formList.map(f => f.id === currentForm.id ? { ...f, title: e.target.value } : f);
                      triggerSave(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Assigned Target</label>
                  <select
                    value={currentForm.assignedTo}
                    onChange={(e: any) => {
                      const updated = formList.map(f => f.id === currentForm.id ? { ...f, assignedTo: e.target.value } : f);
                      triggerSave(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="parent">👨‍👩‍👧 Parent / Guardian</option>
                    <option value="provider">🏡 Child Care Provider</option>
                    <option value="both">Both (Shared)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={currentForm.category}
                    onChange={(e: any) => {
                      const updated = formList.map(f => f.id === currentForm.id ? { ...f, category: e.target.value } : f);
                      triggerSave(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Admissions">Admissions</option>
                    <option value="Medical">Medical</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Safety">Safety</option>
                    <option value="Legal & Agreement">Legal & Agreement</option>
                  </select>
                </div>
              </div>

              {/* Add Field Button / Expanded Card */}
              {isAddingField ? (
                <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-5 text-xs space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-orange-600" />
                      <span>Add New Form Field to {currentForm.formCode}</span>
                    </h4>
                    <button onClick={() => setIsAddingField(false)} className="text-slate-400 hover:text-slate-900 font-bold">Cancel</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-800 block mb-1">Field Label *</label>
                      <input
                        type="text"
                        placeholder="e.g. Any special dietary allergies?"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Field Type</label>
                      <select
                        value={newFieldType}
                        onChange={(e: any) => setNewFieldType(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      >
                        <option value="text">Short Text</option>
                        <option value="phone">Phone Number</option>
                        <option value="email">Email Address</option>
                        <option value="date">Date Picker</option>
                        <option value="dropdown">Dropdown Menu</option>
                        <option value="radio">Radio Options</option>
                        <option value="textarea">Long Textarea</option>
                        <option value="file_upload">File Upload (Cloud Storage)</option>
                        <option value="consent_clause">Consent Checkbox Clause</option>
                        <option value="signature">Digital Signature</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Layout Width</label>
                      <select
                        value={newFieldGridCols}
                        onChange={(e: any) => setNewFieldGridCols(Number(e.target.value) as 1 | 2)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      >
                        <option value={2}>Half Width (2 Columns)</option>
                        <option value={1}>Full Width (1 Column)</option>
                      </select>
                    </div>

                    {(newFieldType === 'dropdown' || newFieldType === 'radio') && (
                      <div className="sm:col-span-4">
                        <label className="font-bold text-slate-800 block mb-1">Options List (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="Option 1, Option 2, Option 3"
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-3">
                      <label className="font-bold text-slate-800 block mb-1">Helper / Guidance Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. As required under Sabrina's Law or CCEYA guidelines"
                        value={newFieldHelpText}
                        onChange={(e) => setNewFieldHelpText(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFieldRequired}
                          onChange={(e) => setNewFieldRequired(e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <span>Mandatory</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleAddField}
                      className="neo-btn bg-slate-900 text-white px-5 py-2 text-xs font-bold"
                    >
                      Save Field to Form
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingField(true)}
                  className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl text-xs font-bold text-slate-600 hover:text-orange-600 bg-slate-50 hover:bg-orange-50/50 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Field to this Form</span>
                </button>
              )}

              {/* Sections & Existing Fields List */}
              <div className="space-y-6">
                {currentForm.sections.map((sec, secIdx) => (
                  <div key={sec.id} className="bg-slate-50/50 p-5 rounded-2xl border-2 border-slate-200 space-y-4">
                    {/* Section Header with Reorder Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          {secIdx + 1}
                        </span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">{sec.title}</h4>
                        <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">
                          {sec.fields.length} Fields
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={secIdx === 0}
                          onClick={() => handleMoveSection(secIdx, 'up')}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-all"
                          title="Move entire section up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={secIdx === currentForm.sections.length - 1}
                          onClick={() => handleMoveSection(secIdx, 'down')}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-all"
                          title="Move entire section down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Fields List with Move Up/Down & In-Line Edit */}
                    <div className="space-y-2.5">
                      {sec.fields.map((field, fIdx) => (
                        <div key={field.id}>
                          {editingFieldId === field.id ? (
                            /* IN-LINE FIELD EDITOR CARD */
                            <div className="p-4 bg-orange-50/80 border-2 border-orange-400 rounded-xl space-y-4 animate-fadeIn text-xs">
                              <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                                <span className="font-extrabold text-orange-950 flex items-center gap-1.5">
                                  <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                                  <span>Editing Field: {field.label}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingFieldId(null)}
                                  className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-orange-100"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="sm:col-span-2">
                                  <label className="font-bold text-slate-800 block mb-1">Field Label *</label>
                                  <input
                                    type="text"
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-slate-800 block mb-1">Field Type</label>
                                  <select
                                    value={editType}
                                    onChange={(e: any) => setEditType(e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                                  >
                                    <option value="text">Short Text</option>
                                    <option value="phone">Phone Number</option>
                                    <option value="email">Email Address</option>
                                    <option value="date">Date Picker</option>
                                    <option value="dropdown">Dropdown Menu</option>
                                    <option value="radio">Radio Options</option>
                                    <option value="textarea">Long Textarea</option>
                                    <option value="file_upload">File Upload</option>
                                    <option value="consent_clause">Consent Checkbox Clause</option>
                                    <option value="signature">Digital Signature</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="font-bold text-slate-800 block mb-1">Width</label>
                                  <select
                                    value={editGridCols}
                                    onChange={(e: any) => setEditGridCols(Number(e.target.value) as 1 | 2)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                                  >
                                    <option value={2}>Half Width (2 Cols)</option>
                                    <option value={1}>Full Width (1 Col)</option>
                                  </select>
                                </div>

                                {(editType === 'dropdown' || editType === 'radio') && (
                                  <div className="sm:col-span-4">
                                    <label className="font-bold text-slate-800 block mb-1">Options List (comma-separated)</label>
                                    <input
                                      type="text"
                                      value={editOptions}
                                      onChange={(e) => setEditOptions(e.target.value)}
                                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                                      placeholder="Option 1, Option 2, Option 3"
                                    />
                                  </div>
                                )}

                                <div className="sm:col-span-2">
                                  <label className="font-bold text-slate-800 block mb-1">Placeholder Text</label>
                                  <input
                                    type="text"
                                    value={editPlaceholder}
                                    onChange={(e) => setEditPlaceholder(e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                                    placeholder="e.g. Liam, 18 months"
                                  />
                                </div>

                                <div className="sm:col-span-2">
                                  <label className="font-bold text-slate-800 block mb-1">Helper / Guidance Instructions</label>
                                  <input
                                    type="text"
                                    value={editHelpText}
                                    onChange={(e) => setEditHelpText(e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                                    placeholder="e.g. As required under Sabrina's Law"
                                  />
                                </div>

                                <div className="sm:col-span-4 flex items-center justify-between pt-2">
                                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={editRequired}
                                      onChange={(e) => setEditRequired(e.target.checked)}
                                      className="w-4 h-4 text-orange-600 rounded"
                                    />
                                    <span>Mandatory Required Field</span>
                                  </label>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingFieldId(null)}
                                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleSaveEditField}
                                      className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 font-bold gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Save Changes</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* STANDARD FIELD CARD VIEW WITH MOVE & EDIT CONTROLS */
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900">{field.label}</span>
                                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                    field.required ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {field.required ? 'Required' : 'Optional'}
                                  </span>
                                  <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                                    {field.type}
                                  </span>
                                  <span className="text-[10px] bg-slate-50 px-1.5 py-0.2 rounded text-slate-400">
                                    {field.gridCols === 1 ? 'Full Width' : 'Half Width'}
                                  </span>
                                </div>
                                {field.helpText && (
                                  <p className="text-[11px] text-slate-500">{field.helpText}</p>
                                )}
                                {field.options && (
                                  <p className="text-[10px] text-slate-400">Options: {field.options.join(', ')}</p>
                                )}
                              </div>

                              {/* Action Buttons: Move Up, Move Down, Edit, Delete */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  disabled={fIdx === 0}
                                  onClick={() => handleMoveField(sec.id, fIdx, 'up')}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed text-slate-600 transition-all"
                                  title="Move field up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  disabled={fIdx === sec.fields.length - 1}
                                  onClick={() => handleMoveField(sec.id, fIdx, 'down')}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed text-slate-600 transition-all"
                                  title="Move field down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStartEditField(field)}
                                  className="px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 font-bold text-orange-800 flex items-center gap-1 transition-all"
                                  title="Edit field settings"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteField(field.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                                  title="Remove field"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE PARENT / PROVIDER PREVIEW */}
          {activeTab === 'preview' && (
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 space-y-6 max-w-3xl mx-auto">
              <div className="pb-3 border-b-2 border-slate-900">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  currentForm.assignedTo === 'provider' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {currentForm.formCode} — Live {currentForm.assignedTo === 'provider' ? 'Provider' : 'Parent'} View
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{currentForm.title}</h3>
                <p className="text-xs text-slate-500">{currentForm.description}</p>
              </div>

              {currentForm.sections.map(sec => (
                <div key={sec.id} className="space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">{sec.title}</h4>
                    {sec.description && <p className="text-[11px] text-slate-500">{sec.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {sec.fields.map(f => (
                      <div key={f.id} className={f.gridCols === 1 ? 'sm:col-span-2' : ''}>
                        {f.type === 'consent_clause' ? (
                          <label className="flex items-start gap-2.5 p-3 bg-white border border-slate-300 rounded-xl cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 text-orange-600 mt-0.5 rounded" />
                            <span className="font-bold text-slate-800 leading-snug">{f.label}</span>
                          </label>
                        ) : f.type === 'notice_block' ? (
                          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                            <span>{f.label}</span>
                          </div>
                        ) : f.type === 'signature' ? (
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">{f.label} {f.required && '*'}</label>
                            <input
                              type="text"
                              placeholder={f.placeholder || 'Type Full Legal Name'}
                              className="w-full p-2.5 bg-white border-2 border-slate-900 rounded-xl font-mono text-sm"
                            />
                          </div>
                        ) : f.type === 'dropdown' ? (
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">{f.label} {f.required && '*'}</label>
                            <select className="w-full p-2.5 bg-white border border-slate-300 rounded-xl">
                              {f.options?.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        ) : f.type === 'textarea' ? (
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">{f.label} {f.required && '*'}</label>
                            <textarea rows={3} placeholder={f.placeholder} className="w-full p-2.5 bg-white border border-slate-300 rounded-xl" />
                          </div>
                        ) : (
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">{f.label} {f.required && '*'}</label>
                            <input
                              type={f.type === 'phone' ? 'tel' : f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : 'text'}
                              placeholder={f.placeholder}
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                            />
                            {f.helpText && <p className="text-[10px] text-slate-400 mt-1">{f.helpText}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RAW JSON SCHEMA VIEW */}
          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Firestore Document Schema Representation:</span>
                <span className="text-[10px] font-mono text-slate-400">{JSON.stringify(currentForm).length} bytes</span>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96 border-2 border-slate-800 leading-relaxed">
                {JSON.stringify(currentForm, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: VERSION HISTORY LEDGER DRAWER */}
      {isVersionDrawerOpen && currentForm && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsVersionDrawerOpen(false);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-slate-900 rounded-3xl w-full max-w-2xl shadow-neo max-h-[90vh] flex flex-col overflow-hidden cursor-default"
          >
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-slate-900 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-900 text-white">
                  <History className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {currentForm.formCode}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">Version History & Rollback Ledger</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chronological audit snapshots stored in Cloud Firestore for {currentForm.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVersionDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Version List Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {isLoadingVersions ? (
                <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-4 border-slate-900 border-t-amber-400 rounded-full animate-spin" />
                  <span>Loading version records from Firestore...</span>
                </div>
              ) : versionHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  <p>No historical versions recorded yet.</p>
                  <p className="text-xs text-slate-400 mt-1">This form is currently running its initial baseline.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versionHistory.map((ver, idx) => {
                    const isActive = ver.versionTag === currentForm.version || (idx === 0 && !ver.isFactoryDefault);

                    return (
                      <div
                        key={ver.id || `ver-${idx}`}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isActive 
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-neo-sm' 
                            : 'border-slate-300 bg-slate-50 hover:border-slate-900'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                              isActive 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              v{ver.versionTag}
                            </span>

                            {isActive && (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                Active Live Schema
                              </span>
                            )}

                            {ver.isFactoryDefault && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                Factory Default
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(ver.timestamp).toLocaleString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{ver.author}</span>
                          </div>
                        </div>

                        <p className="text-xs font-medium text-slate-800 mt-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                          {ver.changeSummary || 'Standard form schema update'}
                        </p>

                        {!isActive && (
                          <div className="mt-3 flex items-center justify-end">
                            <button
                              onClick={() => {
                                setPendingRollbackVersion(ver);
                                setIsRollbackConfirmOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              <span>Rollback to v{ver.versionTag}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t-2 border-slate-900 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                All changes append new versions. Prior states are never overwritten or destroyed.
              </span>
              <button
                onClick={() => setIsVersionDrawerOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl border border-slate-900 hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL 2: ROLLBACK CONFIRMATION MODAL */}
      {isRollbackConfirmOpen && pendingRollbackVersion && currentForm && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsRollbackConfirmOpen(false);
                setPendingRollbackVersion(null);
              }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-slate-900 rounded-3xl w-full max-w-md shadow-neo p-6 space-y-4 cursor-default"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Confirm Schema Rollback</h3>
                <p className="text-xs text-slate-500">Restore prior version snapshot</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Form:</span>
                <span className="font-bold text-slate-800">{currentForm.formCode} ({currentForm.title})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Restoring Version:</span>
                <span className="font-mono font-bold text-emerald-700">v{pendingRollbackVersion.versionTag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Original Author:</span>
                <span className="font-bold text-slate-700">{pendingRollbackVersion.author}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                Summary: <span className="font-medium">{pendingRollbackVersion.changeSummary}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will create a new version increment in Firestore restoring this snapshot. All existing versions remain preserved in history.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsRollbackConfirmOpen(false);
                  setPendingRollbackVersion(null);
                }}
                disabled={isPerformingVersionAction}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRollback}
                disabled={isPerformingVersionAction}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                {isPerformingVersionAction ? 'Restoring...' : 'Confirm & Restore'}
              </button>
            </div>
          </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL 3: FACTORY RESET CONFIRMATION MODAL */}
      {isFactoryResetModalOpen && currentForm && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFactoryResetModalOpen(false);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-slate-900 rounded-3xl w-full max-w-md shadow-neo p-6 space-y-4 cursor-default"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Reset to Factory Default?</h3>
                <p className="text-xs text-slate-500">Restore Ontario CCEYA baseline</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reset <strong className="text-slate-900">{currentForm.formCode}: {currentForm.title}</strong> to the factory default baseline?
            </p>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Zero Data Loss Protection
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your current custom fields and modifications will be archived as a prior version in Firestore before the factory reset is applied. You can rollback at any time.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsFactoryResetModalOpen(false)}
                disabled={isPerformingVersionAction}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFactoryReset}
                disabled={isPerformingVersionAction}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                {isPerformingVersionAction ? 'Resetting...' : 'Yes, Reset to Default'}
              </button>
            </div>
          </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};
