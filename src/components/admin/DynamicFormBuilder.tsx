import React, { useState } from 'react';
import { DynamicFormField } from '../../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Settings2, 
  ShieldAlert, 
  Sparkles, 
  Save, 
  ListPlus,
  HelpCircle
} from 'lucide-react';

interface DynamicFormBuilderProps {
  fields: DynamicFormField[];
  onSaveFields: (fields: DynamicFormField[]) => void;
}

export const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  fields,
  onSaveFields
}) => {
  const [formFields, setFormFields] = useState<DynamicFormField[]>(fields);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Field State
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<'text' | 'dropdown' | 'checkbox' | 'date'>('text');
  const [newCategory, setNewCategory] = useState<'medical' | 'general' | 'emergency' | 'dietary'>('general');
  const [newRequired, setNewRequired] = useState(true);
  const [newHelpText, setNewHelpText] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('');

  const handleAddField = () => {
    if (!newLabel.trim()) return;

    const newField: DynamicFormField = {
      id: `field-${Date.now()}`,
      label: newLabel,
      type: newType,
      category: newCategory,
      required: newRequired,
      helpText: newHelpText,
      options: newType === 'dropdown' ? newOptionsText.split(',').map(s => s.trim()).filter(Boolean) : undefined
    };

    const updated = [...formFields, newField];
    setFormFields(updated);
    onSaveFields(updated);

    // Reset Form
    setNewLabel('');
    setNewHelpText('');
    setNewOptionsText('');
    setIsAddingNew(false);
    showSavedBadge();
  };

  const handleDeleteField = (id: string) => {
    const updated = formFields.filter(f => f.id !== id);
    setFormFields(updated);
    onSaveFields(updated);
    showSavedBadge();
  };

  const handleToggleRequired = (id: string) => {
    const updated = formFields.map(f => f.id === id ? { ...f, required: !f.required } : f);
    setFormFields(updated);
    onSaveFields(updated);
    showSavedBadge();
  };

  const showSavedBadge = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredFields = activeCategory === 'all' 
    ? formFields 
    : formFields.filter(f => f.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header & Explanation */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-neo-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">Dynamic Registration Form Configurator</h2>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-300">
              Reg-Proof (Zero Code Redeployment)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            When Ontario Ministry of Education or CCEYA guidelines update, modify question text, allergy drop-downs, and required document rules directly without hiring a developer or rebuilding code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Saved to Firestore</span>
            </span>
          )}

          <button
            onClick={() => setIsAddingNew(true)}
            className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 text-xs font-bold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Question</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['all', 'medical', 'dietary', 'emergency', 'general'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-neo-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat} Fields ({cat === 'all' ? formFields.length : formFields.filter(f => f.category === cat).length})
          </button>
        ))}
      </div>

      {/* Add New Field Modal / Card */}
      {isAddingNew && (
        <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-5 shadow-neo animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-orange-200 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ListPlus className="w-4 h-4 text-orange-600" />
              <span>Configure New Form Field</span>
            </h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-800 block mb-1">Question / Field Label *</label>
              <input
                type="text"
                placeholder="E.g., Any religious or cultural fasting periods?"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Field Type</label>
              <select
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
              >
                <option value="text">Single Line Text</option>
                <option value="dropdown">Dropdown Menu</option>
                <option value="checkbox">Yes/No Checkbox</option>
                <option value="date">Date Picker</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Section Category</label>
              <select
                value={newCategory}
                onChange={(e: any) => setNewCategory(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium capitalize"
              >
                <option value="medical">Medical</option>
                <option value="dietary">Dietary</option>
                <option value="emergency">Emergency</option>
                <option value="general">General</option>
              </select>
            </div>

            {newType === 'dropdown' && (
              <div className="sm:col-span-4">
                <label className="font-bold text-slate-800 block mb-1">
                  Dropdown Options (comma-separated list)
                </label>
                <input
                  type="text"
                  placeholder="Option 1, Option 2, Option 3, Other"
                  value={newOptionsText}
                  onChange={(e) => setNewOptionsText(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                />
              </div>
            )}

            <div className="sm:col-span-3">
              <label className="font-bold text-slate-800 block mb-1">Helper Instructions for Parents</label>
              <input
                type="text"
                placeholder="E.g., Optional note to matched child care provider"
                value={newHelpText}
                onChange={(e) => setNewHelpText(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <span>Mandatory Field</span>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-orange-200 flex justify-end gap-2">
            <button
              onClick={handleAddField}
              className="neo-btn bg-slate-900 text-white px-4 py-1.5 text-xs font-bold gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to Live Parent Form</span>
            </button>
          </div>
        </div>
      )}

      {/* Field List */}
      <div className="space-y-3">
        {filteredFields.map(field => (
          <div
            key={field.id}
            className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-neo-sm hover:shadow-neo transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{field.label}</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  field.required ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {field.required ? 'Required' : 'Optional'}
                </span>
                <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  {field.category}
                </span>
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  Type: {field.type}
                </span>
              </div>

              {field.helpText && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  <span>{field.helpText}</span>
                </p>
              )}

              {field.options && field.options.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {field.options.map((opt, i) => (
                    <span key={i} className="text-[11px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                      • {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Field Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => handleToggleRequired(field.id)}
                className={`neo-btn px-2.5 py-1 text-[11px] font-bold ${
                  field.required ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700 border-red-300'
                }`}
              >
                {field.required ? 'Make Optional' : 'Make Required'}
              </button>

              <button
                onClick={() => handleDeleteField(field.id)}
                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                title="Remove field"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
