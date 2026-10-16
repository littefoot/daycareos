export type FieldType = 
  | 'text' 
  | 'phone' 
  | 'email' 
  | 'date' 
  | 'time'
  | 'dropdown' 
  | 'multiselect'
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'file_upload' 
  | 'signature' 
  | 'notice_block' 
  | 'consent_clause';

export interface FormField {
  id: string;
  name: string; // internal key (e.g. 'health_card_number')
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[]; // for dropdown, radio
  defaultValue?: any;
  gridCols?: 1 | 2 | 3; // layout column span
  order?: number; // visual sequence order within section
  category?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  formCode: string; // e.g. 'FORM-0', 'FORM-1', 'FORM-5'
  title: string;
  category: 'Admissions' | 'Medical' | 'Safety' | 'Legal & Agreement' | 'Emergency' | 'Inspection' | 'Operations' | 'Special Needs' | 'Compliance';
  description: string;
  version: string;
  isRequired: boolean;
  targetStage: 'inquiry' | 'registration' | 'placement' | 'annual';
  assignedTo: 'parent' | 'provider' | 'visitor' | 'supplemental' | 'both';
  sections: FormSection[];
  lastUpdated: string;
  versionNumber?: number; // integer version counter (e.g. 1, 2, 3)
  lastModifiedBy?: string; // e.g. "Agency Director (Admin)", "AI Assistant (Gemini/GPT)", "Factory Default"
  changeSummary?: string; // Brief description of what changed in this version
}

export interface FormVersionRecord {
  id: string; // e.g. "v1", "v2"
  versionNumber: number;
  versionTag: string; // e.g. "2026.1", "2026.2"
  timestamp: string; // ISO string
  author: string; // e.g. "Agency Director (Admin)", "AI Assistant", "Factory Default"
  changeSummary: string;
  isFactoryDefault?: boolean;
  formSnapshot: FormTemplate;
}

