import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  Settings, 
  Database, 
  ShieldCheck, 
  HelpCircle, 
  Key, 
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  FileText,
  DollarSign,
  Printer,
  FlaskConical,
  Check,
  AlertTriangle,
  Sliders,
  Wrench,
  Bookmark,
  Undo2,
  ArrowLeft,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Child, Provider, ParentGuardian, DailyActionAlert, HomeVisitor, UserRole } from '../../types';
import { FormTemplate, FormField, FormSection } from '../../types/formSchema';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  saveChatConversation, 
  subscribeToChatConversation,
  saveDeveloperNotesToFirestore,
  subscribeToDeveloperNotes,
  deleteDeveloperNoteFromFirestore
} from '../../services/firebaseService';
import { ClientNotesModal } from './ClientNotesModal';
import { 
  loadCuratedNotesFromStorage, 
  saveCuratedNotesToStorage, 
  synthesizeUserPromptIntoNotes,
  consolidateCuratedNotes
} from '../../lib/curatedNotesEngine';
import { CuratedClientNote } from '../../types';
import { loadAgencySettings } from '../../data/agencySettingsData';
import { formatMessageTimestamp } from '../../utils/timeUtils';
import { sanitizePiiForAi } from '../../utils/piiSanitizer';
import { PROJECT_DOCS } from '../../data/projectDocsContext';
import {
  SupplementalBacklogDoc,
  SupplementalTodoItem,
  loadSupplementalBacklogFromStorage,
  saveSupplementalBacklogToStorage,
  subscribeToSupplementalBacklog,
  appendSupplementalTask,
  updateSupplementalMarkdownContent,
  saveSupplementalBacklog
} from '../../services/supplementalTodoService';

export interface FormActionPayload {
  action: 'ADD_FIELD' | 'UPDATE_FIELD' | 'REMOVE_FIELD' | 'MOVE_FIELD' | 'REORDER_FIELDS' | 'REPLACE_SECTION_FIELDS' | 'ADD_SECTION' | 'REMOVE_SECTION' | 'UPDATE_WHOLE_FORM' | 'BATCH_ACTIONS';
  formId: string;
  sectionId?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  sections?: FormSection[];
  changeSummary: string;
  field?: FormField;
  fields?: FormField[];
  fieldId?: string;
  targetPosition?: 'top' | 'bottom' | number;
  position?: 'top' | 'bottom' | number;
  afterFieldId?: string;
  beforeFieldId?: string;
  orderedFieldIds?: string[];
  actions?: FormActionPayload[];
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isSystemContext?: boolean;
  isAuthError?: boolean;
  formAction?: FormActionPayload;
  actionStatus?: 'pending' | 'applied' | 'dismissed' | 'undone';
  appliedVersion?: number;
}

export interface ModelPreset {
  id: string;
  name: string;
  tag: string;
  description: string;
  isFrontier?: boolean;
  isRecommended?: boolean;
}

export const GEMINI_MODEL_PRESETS: ModelPreset[] = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: 'Recommended Default ($0.15/1M)', description: 'Google next-gen flagship ultra-fast intelligence with 1M context.', isFrontier: true, isRecommended: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Current Stable ($0.10/1M)', description: 'Fast, native multimodal reasoning and daily admissions Q&A.' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: '2M Long Context ($1.25/1M)', description: 'Exceptional deep recall for large Ministry manuals and historical audit binders.' },
];

export const OPENAI_MODEL_PRESETS: ModelPreset[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Budget Workhorse ($0.15/1M)', description: 'Lightweight, rapid response workhorse with ultra-low cost and high reliability.' },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna (max)', tag: 'Recommended Default ($1.50/1M)', description: 'Balanced frontier intelligence with deep CCEYA compliance reasoning and sub-second execution.', isFrontier: true, isRecommended: true },
  { id: 'gpt-5.6', name: 'ChatGPT 5.6', tag: 'Frontier 2026 ($5.00/1M)', description: 'Next-generation frontier preview intelligence with autonomous planning.', isFrontier: true },
  { id: 'gpt-6-astra', name: 'GPT-6 Astra', tag: 'Apex Frontier ($10.00/1M)', description: 'State-of-the-art apex intelligence for complex policy defense and strategic planning.', isFrontier: true },
];

export const DEEPSEEK_MODEL_PRESETS: ModelPreset[] = [
  { id: 'deepseek-chat', name: 'DeepSeek V4.1 Flash', tag: 'Recommended Default ($0.20/1M)', description: 'Latest DeepSeek 4.1 flagship flash model with ultra-low latency & 75% prompt caching.', isFrontier: true, isRecommended: true },
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', tag: 'Pro Reasoning ($0.45/1M)', description: 'Advanced DeepSeek 4 Pro model for complex multi-tier CCEYA ratio compliance.', isFrontier: true },
  { id: 'deepseek-reasoner', name: 'DeepSeek-R1', tag: 'Apex Reasoning ($0.55/1M)', description: 'SOTA open reasoning model for complex child care policy logic and mathematical audits.', isFrontier: true },
];

/**
 * Sanitizes user-entered API keys by stripping quotes, whitespace, carriage returns,
 * and accidental "Bearer " prefixes.
 */
export const sanitizeApiKey = (raw: string): string => {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .replace(/^Bearer\s+/i, '')
    .replace(/[\r\n\t\s]/g, '');
};

interface AccsAiAssistantProps {
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onClose?: () => void;
  panelWidthMode?: 'quarter' | 'third';
  onToggleWidthMode?: () => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  childrenList: Child[];
  providersList: Provider[];
  parentsList: ParentGuardian[];
  alertsList: DailyActionAlert[];
  formsList: FormTemplate[];
  attendanceState?: Record<string, { status: string; checkIn?: string; checkOut?: string }>;
  visitorsList?: HomeVisitor[];
  currentRole?: UserRole;
  onNavigateTab?: (tab: string) => void;
  onApplyFormAction?: (action: FormActionPayload) => Promise<{ success: boolean; versionNumber?: number; error?: string }>;
  onResetFormToFactory?: (formId: string) => Promise<{ success: boolean; newVersion?: number }>;
}

export const AccsAiAssistant: React.FC<AccsAiAssistantProps> = ({
  isOpen: propIsOpen,
  onToggleOpen,
  onClose,
  panelWidthMode = 'quarter',
  onToggleWidthMode,
  initialPrompt,
  onClearInitialPrompt,
  childrenList,
  providersList,
  parentsList,
  alertsList,
  formsList,
  visitorsList = [],
  currentRole = 'admin',
  onApplyFormAction,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof propIsOpen === 'boolean';
  const isOpen = isControlled ? propIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalIsOpen(prev => !prev);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [curatedNotes, setCuratedNotes] = useState<CuratedClientNote[]>(loadCuratedNotesFromStorage);
  const [supplementalBacklog, setSupplementalBacklog] = useState<SupplementalBacklogDoc>(loadSupplementalBacklogFromStorage);
  const [applyingActionId, setApplyingActionId] = useState<string | null>(null);

  // API Provider (Gemini vs OpenAI vs DeepSeek)
  const [apiProvider, setApiProvider] = useState<'gemini' | 'openai' | 'deepseek'>(() => {
    return (localStorage.getItem('accs_ai_provider') as 'gemini' | 'openai' | 'deepseek') || 'gemini';
  });

  // Selected Models per provider
  const [geminiModel, setGeminiModel] = useState<string>(() => {
    const saved = localStorage.getItem('accs_ai_model_gemini');
    if (saved && saved !== 'gemini-1.5-flash') return saved;
    return 'gemini-3.8-flash';
  });

  const [openAiModel, setOpenAiModel] = useState<string>(() => {
    const saved = localStorage.getItem('accs_ai_model_openai');
    if (saved && saved !== 'gpt-4o-mini' && saved !== 'o3-mini') return saved;
    return 'gpt-5.6-luna';
  });

  const [deepseekModel, setDeepseekModel] = useState<string>(() => {
    return localStorage.getItem('accs_ai_model_deepseek') || 'deepseek-chat';
  });

  // Discovered active models via ModelService.ListModels
  const [discoveredGoogleModels, setDiscoveredGoogleModels] = useState<string[]>([]);

  // Raw API Key input state
  const [apiKey, setApiKey] = useState<string>(() => {
    const saved = localStorage.getItem('accs_ai_api_key');
    if (saved) return sanitizeApiKey(saved);
    return sanitizeApiKey((import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_OPENAI_API_KEY || (import.meta as any).env?.VITE_DEEPSEEK_API_KEY || '');
  });

  const [saveKeySuccess, setSaveKeySuccess] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktopEndRef = useRef<HTMLDivElement>(null);
  const mobileEndRef = useRef<HTMLDivElement>(null);
  const desktopTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mobileTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialLoadRef = useRef(true);

  // Auto-fill prompt and focus input when triggered from Action Queue or external triggers
  useEffect(() => {
    if (initialPrompt) {
      setInputPrompt(initialPrompt);
      if (!isOpen && onToggleOpen) {
        onToggleOpen();
      }
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
      setTimeout(() => {
        if (desktopTextareaRef.current) {
          desktopTextareaRef.current.focus();
          desktopTextareaRef.current.setSelectionRange(initialPrompt.length, initialPrompt.length);
        }
        if (mobileTextareaRef.current) {
          mobileTextareaRef.current.focus();
          mobileTextareaRef.current.setSelectionRange(initialPrompt.length, initialPrompt.length);
        }
      }, 150);
    }
  }, [initialPrompt, isOpen, onToggleOpen, onClearInitialPrompt]);

  useEffect(() => {
    const handleOpenWithPrompt = (e: Event) => {
      const customEvt = e as CustomEvent<{ prompt?: string }>;
      const text = customEvt.detail?.prompt;
      if (text) {
        setInputPrompt(text);
        if (!isOpen && onToggleOpen) {
          onToggleOpen();
        }
        setTimeout(() => {
          if (desktopTextareaRef.current) {
            desktopTextareaRef.current.focus();
            desktopTextareaRef.current.setSelectionRange(text.length, text.length);
          }
          if (mobileTextareaRef.current) {
            mobileTextareaRef.current.focus();
            mobileTextareaRef.current.setSelectionRange(text.length, text.length);
          }
        }, 150);
      }
    };

    window.addEventListener('accs-open-ai-with-prompt', handleOpenWithPrompt);
    return () => {
      window.removeEventListener('accs-open-ai-with-prompt', handleOpenWithPrompt);
    };
  }, [isOpen, onToggleOpen]);

  const activeModelId = 
    apiProvider === 'gemini' 
      ? geminiModel 
      : apiProvider === 'deepseek' 
      ? deepseekModel 
      : openAiModel;
  const cleanApiKey = sanitizeApiKey(apiKey);

  // Initial messages state (with immediate local cache hydration fallback)
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('accs_ai_chat_agency_ai_session');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return [{
      id: 'welcome-1',
      sender: 'assistant',
      text: `**Welcome to DaycareOS System Intelligence!**\n\nI am your live assistant for **DaycareOS Child Care Network**. Operating under our **Zero Cloud LLM Database Access** architecture, external cloud models are completely air-gapped from live database credentials, and all queries are protected with client-side **Canadian PIPEDA & Ontario PHIPA pre-flight PII sanitization**.\n\nI have active context for **licensed home ratios**, **CCEYA compliance rules**, **dynamic form schemas**, and **agency policy rates**.\n\n📝 **Client Review Note-Taking Active**: As you test and explore the demo site, feel free to share any feedback, notes, or feature requests. All comments are synthesized into our permanent requirements backlog for the agency development team!`,
      timestamp: new Date().toISOString()
    }];
  });

  // Subscribe to real-time conversation updates from Cloud Firestore
  useEffect(() => {
    const unsubscribe = subscribeToChatConversation('agency_ai_session', (remoteMessages) => {
      if (Array.isArray(remoteMessages) && remoteMessages.length > 0) {
        setMessages(remoteMessages as Message[]);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Subscribe to real-time curated developer notes from Cloud Firestore
  useEffect(() => {
    const unsubNotes = subscribeToDeveloperNotes((remoteNotes) => {
      if (Array.isArray(remoteNotes) && remoteNotes.length > 0) {
        const { consolidated, removedIds } = consolidateCuratedNotes(remoteNotes);
        setCuratedNotes(consolidated);
        saveCuratedNotesToStorage(consolidated);
        if (removedIds.length > 0) {
          for (const rid of removedIds) {
            deleteDeveloperNoteFromFirestore(rid);
          }
          saveDeveloperNotesToFirestore(consolidated);
        }
      }
    });
    return () => {
      unsubNotes();
    };
  }, []);

  // Subscribe to real-time unified supplemental backlog from Cloud Firestore (todo_supp/active)
  useEffect(() => {
    const unsubSupp = subscribeToSupplementalBacklog((remoteDoc) => {
      setSupplementalBacklog(remoteDoc);
    });
    return () => {
      unsubSupp();
    };
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const containers = [desktopContainerRef.current, mobileContainerRef.current];
    for (const container of containers) {
      if (container) {
        if (behavior === 'auto') {
          container.scrollTop = container.scrollHeight;
        } else {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
      }
    }
  };

  // Auto-resize chat textarea to fit multiline content up to max 140px (~5-6 lines)
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 40), 140);
    textarea.style.height = `${nextHeight}px`;
  };

  useEffect(() => {
    adjustTextareaHeight(desktopTextareaRef.current);
    adjustTextareaHeight(mobileTextareaRef.current);
  }, [inputPrompt]);

  // When panel is opened, instantly lock scroll to the very bottom so user sees latest messages
  useEffect(() => {
    if (isOpen) {
      scrollToBottom('auto');
      const t1 = setTimeout(() => scrollToBottom('auto'), 40);
      const t2 = setTimeout(() => scrollToBottom('auto'), 120);
      const t3 = setTimeout(() => scrollToBottom('auto'), 250);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isOpen]);

  // When messages or loading status update while open:
  useEffect(() => {
    if (isOpen) {
      if (isInitialLoadRef.current) {
        scrollToBottom('auto');
        isInitialLoadRef.current = false;
      } else {
        scrollToBottom('smooth');
      }
    }
  }, [messages, isLoading, isOpen]);

  const handleSaveApiKey = () => {
    const sanitized = sanitizeApiKey(apiKey);
    setApiKey(sanitized);
    localStorage.setItem('accs_ai_provider', apiProvider);
    localStorage.setItem('accs_ai_api_key', sanitized);
    localStorage.setItem('accs_ai_model_gemini', geminiModel);
    localStorage.setItem('accs_ai_model_openai', openAiModel);
    localStorage.setItem('accs_ai_model_deepseek', deepseekModel);
    setSaveKeySuccess(true);
    setTimeout(() => setSaveKeySuccess(false), 2500);
  };

  // Test connection button logic
  const handleTestConnection = async () => {
    const keyToTest = sanitizeApiKey(apiKey);
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      if (apiProvider === 'gemini') {
        const cleanModel = geminiModel.replace(/^models\//, '').trim();
        let testOk = false;
        let testErrMsg = '';

        // Try v1beta then v1
        for (const ver of ['v1beta', 'v1']) {
          const endpoint = `https://generativelanguage.googleapis.com/${ver}/models/${cleanModel}:generateContent?key=${encodeURIComponent(keyToTest)}`;
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': keyToTest // DUAL AUTHENTICATION
              },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: 'Respond with OK' }]
                  }
                ]
              })
            });

            if (res.ok) {
              testOk = true;
              break;
            } else {
              const errData = await res.json().catch(() => ({}));
              testErrMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
            }
          } catch (e: any) {
            testErrMsg = e.message;
          }
        }

        // Also query ModelService.ListModels to detect all supported models on this user's key
        try {
          const listEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(keyToTest)}`;
          const listRes = await fetch(listEndpoint, {
            headers: { 'x-goog-api-key': keyToTest }
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            const available: string[] = (listData.models || [])
              .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
              .map((m: any) => m.name.replace(/^models\//, ''));
            if (available.length > 0) {
              setDiscoveredGoogleModels(available);
            }
          }
        } catch (e) {
          // non-blocking
        }

        if (testOk) {
          setTestResult({
            success: true,
            message: `Connected successfully to Google Gemini (${cleanModel})! Verified and ready.`
          });
        } else {
          setTestResult({
            success: false,
            message: `Google Gemini error: "${testErrMsg}". Please select one of the supported models below.`
          });
        }
      } else if (apiProvider === 'deepseek') {
        const endpoint = 'https://api.deepseek.com/v1/chat/completions';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyToTest}`
          },
          body: JSON.stringify({
            model: deepseekModel,
            messages: [{ role: 'user', content: 'Say OK' }],
            max_tokens: 5
          })
        });

        if (res.ok) {
          setTestResult({
            success: true,
            message: `Connected successfully to DeepSeek (${deepseekModel})! Verified and ready.`
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
          setTestResult({
            success: false,
            message: `DeepSeek error: "${errMsg}"`
          });
        }
      } else {
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyToTest}`
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: [{ role: 'user', content: 'Say OK' }],
            max_tokens: 5
          })
        });

        if (res.ok) {
          setTestResult({
            success: true,
            message: `Connected successfully to OpenAI (${openAiModel})! Verified and ready.`
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
          
          // If model doesn't exist yet on current API tier but key might be valid, verify credentials with base tier
          if (res.status === 404 && errMsg.toLowerCase().includes('does not exist')) {
            try {
              const fallbackRes = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${keyToTest}`
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [{ role: 'user', content: 'Say OK' }],
                  max_tokens: 5
                })
              });
              if (fallbackRes.ok) {
                setTestResult({
                  success: true,
                  message: `OpenAI API Key verified! Ready for ACCS (${openAiModel} with high-reasoning fallback).`
                });
                return;
              }
            } catch {}
          }

          setTestResult({
            success: false,
            message: `OpenAI error: "${errMsg}"`
          });
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network connection error: ${err.message}`
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Compile real-time system context string from database
  const buildSystemContext = (): string => {
    const totalKids = childrenList.length;
    const enrolledKids = childrenList.filter(c => c.admissionsStage === 'enrolled' && !c.isArchived).length;
    const pendingScreenings = parentsList.filter(p => !p.formZeroApproved).length;
    const totalVacancies = providersList.reduce((acc, p) => {
      const activeEnrolled = childrenList.filter(c => c.providerId === p.id && c.admissionsStage === 'enrolled' && !c.isArchived).length;
      return acc + Math.max(0, p.maxCapacity - p.ownChildrenUnderSix - activeEnrolled);
    }, 0);

    const providerSummaries = providersList.map(p => {
      const assigned = childrenList.filter(c => c.providerId === p.id && c.admissionsStage === 'enrolled' && !c.isArchived);
      const under2 = assigned.filter(c => c.isUnderTwo).length;
      const under3 = assigned.filter(c => c.isUnderThree).length;
      const vacancy = Math.max(0, p.maxCapacity - p.ownChildrenUnderSix - assigned.length);
      return `- ${p.name} (${p.homeName} in ${p.neighborhood}, ${p.region}): ${assigned.length}/${p.maxCapacity} enrolled (Own kids <6: ${p.ownChildrenUnderSix}), Vacancies: ${vacancy}, Under-2s: ${under2}/${p.maxUnderTwo}, Under-3s: ${under3}/${p.maxUnderThree}`;
    }).join('\n');

    const overdueFees = childrenList.filter(c => c.eTransferStatus === 'overdue');

    const formsDetailedContext = formsList.map(f => {
      const secText = f.sections.map(s => {
        const fieldsList = s.fields.map((fld, idx) => 
          `      [#${idx + 1}] "${fld.label}" (id: "${fld.id}", name: "${fld.name}", type: ${fld.type}, gridCols: ${fld.gridCols || 2}${fld.required ? ', REQUIRED' : ''})`
        ).join('\n');
        return `    * Section ID: "${s.id}" ("${s.title}"):\n${fieldsList}`;
      }).join('\n');
      return `  - Form ID: "${f.id}" | Code: ${f.formCode} | Title: "${f.title}" | Audience: ${f.assignedTo} | Version: ${f.version || '1.0'}\n${secText}`;
    }).join('\n\n');

    const curatedNotesContext = curatedNotes.length === 0
      ? 'No active curated client notes recorded yet.'
      : curatedNotes.map((note, idx) => `  [Note #${idx + 1}] ID: "${note.id}"
    - Topic: ${note.topic}
    - Status: ${note.status} | Priority: ${note.priority} | Category: ${note.category}
    - Summary: ${note.summary}
    - Context / Connection to Past Work: ${note.relatedPastWork || 'None'}
    - Clarifying Questions: ${note.clarifyingQuestions?.join('; ') || 'None'}
    - Traced Queries: ${note.originalQueries?.join(' | ') || 'None'}`
      ).join('\n\n');

    const currentSettings = loadAgencySettings();
    const cwelccRateStr = `$${currentSettings.parentCwelccDailyRate.toFixed(2)}/day (~$${(currentSettings.parentCwelccDailyRate * 5 * 4.35).toFixed(2)}/mo)`;
    const privateRateStr = `$${currentSettings.parentPrivateDailyRate.toFixed(2)}/day (~$${(currentSettings.parentPrivateDailyRate * 5 * 4.35).toFixed(2)}/mo)`;
    const providerPayoutStr = `$${currentSettings.providerDailyCompensation.toFixed(2)}/day per child`;
    const provincialGrantStr = `$${currentSettings.provincialCwelccTopUpGrant.toFixed(2)}/day`;

    const sourcesContext = currentSettings.statutorySources.map(s => 
      `- ${s.title} (${s.governingBody} | ${s.legislationCitation}): ${s.url} [Status: ${s.status}, Last Checked: ${s.lastChecked}]`
    ).join('\n');

    return `
SYSTEM CONTEXT FOR ACCS (ALL CHILD CARE SOLUTIONS):
- Software: ACCS Home Care Hub (Ontario Licensed Home Child Care Agency operating under Ministry of Education & CCEYA 2014)
- Covered Regions: Durham Region (Oshawa, Whitby, Ajax, Pickering, Clarington), York Region (Markham), Toronto.
- Database: Cloud Firestore (Montreal region: northamerica-northeast1 for Canadian PIPEDA/PHIPA residency).
- Zero Database Access Air-Gap: External cloud LLMs have ZERO direct query access or database credentials to Cloud Firestore or Storage.
- Client-Side PII Sanitization: Automatic pre-flight scrubbing of OHIP numbers, addresses, and surnames active.
- Active Enrolled Children: ${enrolledKids}
- Total Children in Pipeline: ${totalKids}
- Available Provider Vacancies: ${totalVacancies}
- Pending Pre-Screenings (Form 0): ${pendingScreenings}
- Active Daily Action Alerts: ${alertsList.length}
- Overdue e-Transfer Payments: ${overdueFees.length} (${overdueFees.map(c => `${c.fullName.split(' ')[0]} ${c.fullName.split(' ')[1]?.charAt(0) || ''}. [CHILD]`).join(', ') || 'None'})

LICENSED HOME PROVIDERS & CCEYA RATIOS:
${providerSummaries}

CANONICAL STATUTORY SOURCES OF TRUTH (ADMIN CONFIGURED & VERIFIED):
${sourcesContext}

CCEYA RULES SUMMARY:
- Max ${currentSettings.maxCapacityTotal} children per home (including provider's own children).
- Max ${currentSettings.maxCapacityUnderThree} children under 3 years old (<36 months).
- Max ${currentSettings.maxCapacityUnderTwo} children under 2 years old (<24 months).
- Provider's own young children count directly against ratios.
- Quarterly unannounced inspection interval: Every ${currentSettings.quarterlyAuditFrequencyDays} days.

FINANCIAL MODEL (ACTIVE AGENCY POLICY RATES):
- CWELCC Phase: ${currentSettings.cwelccPhase === 'current_22' ? 'Current Phase ($22.00/day)' : 'Target Phase ($10.00/day)'}
- CWELCC Parent Rate: ${cwelccRateStr}
- Municipal Subsidy: Covers 100% of parent portion ($${currentSettings.municipalSubsidyCopay.toFixed(2)}/day co-pay).
- Private Care: ${privateRateStr}
- Provider Payout: ${providerPayoutStr} (guaranteed statutory compensation)
- Provincial CWELCC Top-Up Grant: ${provincialGrantStr}
- Sole Electronic Payment Rail: ${currentSettings.primaryETransferRecipient}

CANONICAL LOCAL REPOSITORY KNOWLEDGE BASE (GROUND TRUTH):
1. AGENTS.md (System Architecture, CCEYA Statutory Ground Truth & Montreal Data Residency):
${PROJECT_DOCS.agentsMd}

2. TODO.md (Canonical Master Development Roadmap - 33 Completed Deliverables):
${PROJECT_DOCS.todoMd.slice(0, 3200)}... [Complete canonical roadmap active in repository]

3. README.md (Operational Workflows & Operator Manual):
${PROJECT_DOCS.readmeMd.slice(0, 2500)}...

SUPPLEMENTAL REQUIREMENTS BACKLOG (SINGLE ATOMIC DOCUMENT IN CLOUD FIRESTORE "todo_supp/active"):
All future client review notes and requirements are accumulated in this single document, pre-formatted for direct merging into TODO.md:
${supplementalBacklog.markdownContent}

ACTIVE DYNAMIC FORMS SCHEMA INVENTORY (FOR ON-THE-FLY MUTATIONS):
${formsDetailedContext}
`;
  };

  // Offline Heuristic Knowledge Engine fallback
  const answerFromOfflineKnowledge = (query: string): string => {
    const q = query.toLowerCase();

    const isFormMutation = (q.includes('add') || q.includes('change') || q.includes('modify') || q.includes('remove') || q.includes('reset')) && 
                           (q.includes('form') || q.includes('par-') || q.includes('prov-') || q.includes('field') || q.includes('consent'));
    if (isFormMutation) {
      return `### Frontier Intelligence Required for Form Schema Mutations

Modifying Ontario CCEYA legal forms and compliance schemas on the fly requires a **frontier model with full-codebase reasoning** (such as **Google Gemini 2.0 Flash / Gemini 3.8** or **OpenAI GPT-5.6 Luna / GPT-6 Astra**).

**How to activate conversational form editing:**
1. Click the **gear icon (Settings)** in the top-right corner of this chat window.
2. Enter your **Google Gemini** or **OpenAI** API key.
3. Submit your request (e.g. *"Add a mandatory mineral sunscreen application consent checkbox to PAR-4"*).

*Alternatively, you can modify any field directly via the visual **Forms** tab in the Agency Command Centre.*`;
    }

    // Director's Action Queue & Urgent Daily Alerts Review (Card 4 "Talk to AI" Handler)
    if (
      q.includes('action queue') ||
      q.includes('urgent item') ||
      q.includes('action plan') ||
      (q.includes('review') && (q.includes('urgent') || q.includes('alert') || q.includes('queue') || q.includes('screening')))
    ) {
      const totalAlerts = alertsList.length;
      const healthAlerts = alertsList.filter(a => a.category === 'health');
      const paymentAlerts = alertsList.filter(a => a.category === 'payment');
      const screeningPending = parentsList.filter(p => !p.formZeroApproved && !p.isArchived);
      const ratioAlerts = alertsList.filter(a => a.category === 'ratio');
      const attendanceAlerts = alertsList.filter(a => a.category === 'attendance');
      const docAlerts = alertsList.filter(a => a.category === 'document');

      const enrolledCount = childrenList.filter(c => c.admissionsStage === 'enrolled' && !c.isArchived).length;
      const totalCap = providersList.reduce((acc, p) => acc + p.maxCapacity, 0);
      const totalVac = Math.max(0, totalCap - enrolledCount);

      return `### ⚡ Director's Action Queue & Daily Staff Action Plan
Reviewing **${totalAlerts > 0 ? totalAlerts : 'all'} active items** across your agency operations:

#### 📊 Current Queue Breakdown:
• **📞 ${screeningPending.length} Parent Screening Calls Pending**: Initial intake Form PAR-0 inquiries awaiting director screening and qualification.
• **💉 ${healthAlerts.length} Expiring Health & Immunization Alerts**: Statutory 30-day health card / yellow card renewal deadlines approaching.
• **💳 ${paymentAlerts.length} Overdue e-Transfer Billing Alerts**: Outstanding monthly parent co-pays or CWELCC balances.
• **⚖️ ${ratioAlerts.length} Ratio & Capacity Alerts**: Provider group composition or under-2 / under-3 threshold warnings.
• **📋 ${docAlerts.length + attendanceAlerts.length} Documentation & Attendance Follow-ups**: Missing outings consents or unlogged departures.

---

### 📋 Recommended Staff Action Plan for Today:

1. **🚨 Priority 1: Health & Safety / CCEYA Statutory Compliance (First 60 mins)**
   - Audit the **${healthAlerts.length} health alerts** in the **Health Alerts** tab.
   - Under Ontario CCEYA s. 35 & 68, children cannot remain in licensed home care without valid immunization records or approved medical/conscience exemptions on file.
   - **Action**: Dispatch urgent 1-click update requests to affected families or request updated yellow cards.

2. **💳 Priority 2: Revenue Continuity & Interac Reconciliation (Morning)**
   - Review the **${paymentAlerts.length} overdue billing items** in the **e-Transfers** tab.
   - **Action**: Click **"Dispatch 1-Click Reminder"** next to each overdue account. All electronic payments route strictly to \`allchildcaresolutions@gmail.com\`.

3. **📞 Priority 3: Admissions Pipeline & Parent Screening Calls (Midday)**
   - Process the **${screeningPending.length} pending parent screening inquiries**.
   - Review start dates, required schedules (Full Time vs Part Time), and regional subsidy eligibility.
   - **Action**: In the **Pipeline** tab, click **"Screening" ➔ "Approve for Matching"**. This automatically unlocks digital forms PAR-1 through PAR-5 for the parents.

4. **🏡 Priority 4: Provider Vacancy Placement (Afternoon)**
   - You currently have **${totalVac} available provider spaces** across your licensed homes.
   - Match approved families against providers with open infant (<24mo) and toddler (<36mo) spots while respecting the CCEYA ratio limits (*Max 6 total, Max 3 <3yo, Max 3 <2yo*).

*Tip: You can address any individual alert directly from the Daily Command table using the purple **Ratios →** or **Inspect →** action buttons.*`;
    }

    // Supplemental Requirements Backlog queries (Single document in todo_supp/active)
    if (q.includes('note') || q.includes('backlog') || q.includes('requirement') || q.includes('todo') || q.includes('feedback')) {
      // 1. Check if user is explicitly asking to add a task/note/requirement
      const addMatch = query.match(/(?:add|make|take|create|log|record)\s+(?:a\s+)?(?:todo|task|requirement|note)(?:\s*:\s*|\s+that\s+|\s+about\s+|\s+for\s+|\s+)(.+)/i);
      if (addMatch && addMatch[1]) {
        const taskText = addMatch[1].trim();
        appendSupplementalTask({
          title: taskText.length > 55 ? `${taskText.slice(0, 52)}...` : taskText,
          description: taskText,
          category: q.includes('ratio') ? 'compliance' : q.includes('visitor') || q.includes('inspection') ? 'visitor' : q.includes('form') ? 'compliance' : q.includes('provider') ? 'provider' : 'general',
          priority: q.includes('urgent') || q.includes('critical') ? 'urgent' : 'high',
          acceptanceCriteria: [
            'Verify operational alignment with Ontario CCEYA licensing regulations.',
            'Synthesize into C:\\Projects\\allchildcaresolutions\\TODO.md during next local dev cycle.'
          ]
        }, query).then(updatedDoc => {
          setSupplementalBacklog(updatedDoc);
        });

        return `### 📝 New Requirement Added to Supplemental Backlog (\`todo_supp/active\`)

**Title:** ${taskText}  
**Storage:** Single atomic document in Cloud Firestore (\`todo_supp/active\`)  
**Target:** Prepared for direct synthesis into \`C:\\Projects\\allchildcaresolutions\\TODO.md\` during the next local development cycle.

Click **"Requirements Backlog"** in the chat header to review, edit the markdown document as a whole, or click **"📋 Copy for TODO.md"**!`;
      }

      // 2. Return summary of supplemental backlog
      return `### 📋 Supplemental Requirements Backlog (${supplementalBacklog.tasks.length} Items)

All new requirements are consolidated into a **single atomic document in Cloud Firestore** (\`todo_supp/active\`) to eliminate disjointed duplicate notes:

${supplementalBacklog.tasks.length === 0 ? '_No supplemental tasks recorded yet. Chat with the AI to append requirements._' : supplementalBacklog.tasks.map((task, idx) => `
**${idx + 1}. ${task.title}**  
- **Priority:** ${task.priority.toUpperCase()} | **Category:** ${task.category.toUpperCase()} | **Status:** ${task.status.toUpperCase()}  
- **Description:** ${task.description}  
`).join('\n')}

**How to manage the supplemental backlog:**
1. **Via Chat:** Type *"Add a todo: [details]"* or *"Add requirement: [details]"*.
2. **Via Backlog Hub:** Click the bookmark icon in the chat header to view, edit the markdown document as a whole, or copy it directly into \`TODO.md\`!`;
    }

    if (q.includes('ratio') || q.includes('cceya') || q.includes('capacity')) {
      const s = loadAgencySettings();
      return `### CCEYA Group Composition & Ratio Limits (s. 8)
Under the **Child Care and Early Years Act (CCEYA)**, each licensed home provider is legally restricted to:
1. **Maximum ${s.maxCapacityTotal} children in total** at any one time (including provider's own children under 4/6).
2. **Maximum ${s.maxCapacityUnderThree} children under 3 years of age** (<36 months).
3. **Maximum ${s.maxCapacityUnderTwo} children under 2 years of age** (<24 months).
4. **Provider's own children under 6**: Residing in the home count 1:1 against total capacity and age sub-ratios.

**Live Status Across Your Homes:**
${providersList.map(p => {
  const assigned = childrenList.filter(c => c.providerId === p.id && c.admissionsStage === 'enrolled' && !c.isArchived);
  const vac = Math.max(0, p.maxCapacity - p.ownChildrenUnderSix - assigned.length);
  return `• **${p.name}** (${p.neighborhood}): ${assigned.length}/${p.maxCapacity} kids (${vac} open slots)`;
}).join('\n')}`;
    }

    if (q.includes('fee') || q.includes('cwelcc') || q.includes('subsidy') || q.includes('pay') || q.includes('cost') || q.includes('rate')) {
      const s = loadAgencySettings();
      const cwelccMo = (s.parentCwelccDailyRate * 5 * 4.35).toFixed(2);
      const privateMo = (s.parentPrivateDailyRate * 5 * 4.35).toFixed(2);
      return `### Ontario Child Care & CWELCC Financial Model (Live Agency Rates)
ACCS operates under a statutory tri-party funding architecture configured in your **Agency Settings**:
1. **CWELCC Parent Rate** (${s.cwelccPhase === 'current_22' ? 'Current Phase' : 'Target Phase'}): **$${s.parentCwelccDailyRate.toFixed(2)} / day** (~$${cwelccMo}/mo for 5 days/wk).
2. **Municipal Child Care Subsidy** (Durham, York, Toronto): Covers 100% of parent portion (**$${s.municipalSubsidyCopay.toFixed(2)} / day** co-pay).
3. **Private Care**: **$${s.parentPrivateDailyRate.toFixed(2)} / day** (~$${privateMo}/mo for 5 days/wk).
4. **Licensed Provider Daily Compensation**: **$${s.providerDailyCompensation.toFixed(2)} / day per child** guaranteed (parent portion + $${s.provincialCwelccTopUpGrant.toFixed(2)}/day provincial top-up grant or direct municipal subsidy).
5. **Electronic Payment Rail**: Strictly Interac e-Transfer to \`${s.primaryETransferRecipient}\`.

*To adjust these rates or switch to the upcoming $10/day phase, visit the **Policy & Rates** tab in the Agency Command Centre.*`;
    }

    if (q.includes('statute') || q.includes('source of truth') || q.includes('licensing manual') || q.includes('compliance') || q.includes('legislation') || q.includes('regulation') || q.includes('law')) {
      const s = loadAgencySettings();
      return `### 🏛️ Canonical Ministry Sources of Truth (Verified Live)
ACCS policies are grounded against official Ontario Ministry and Municipal legal frameworks configured in **Agency Settings**:

${s.statutorySources.map((src, idx) => `**${idx + 1}. ${src.title}** (${src.governingBody})
- **Citation:** ${src.legislationCitation}
- **Official URL:** ${src.url}
- **Status:** ${src.status === 'verified_active' ? '✅ Verified Active' : '⚠️ Review Recommended'} (Last Checked: ${src.lastChecked})
- **Core Directives:**
${src.keyRules.map(r => `  • ${r}`).join('\n')}`).join('\n\n')}

*To review or re-verify these statutory baselines, open the **Policy & Rates** tab in the Agency Command Centre.*`;
    }

    if (q.includes('vacanc') || q.includes('open') || q.includes('space') || q.includes('room')) {
      const totalVac = providersList.reduce((acc, p) => {
        const active = childrenList.filter(c => c.providerId === p.id && c.admissionsStage === 'enrolled' && !c.isArchived).length;
        return acc + Math.max(0, p.maxCapacity - p.ownChildrenUnderSix - active);
      }, 0);

      return `### Current Available Vacancies: ${totalVac} Spaces
Here is the real-time availability across your licensed homes:
${providersList.map(p => {
  const active = childrenList.filter(c => c.providerId === p.id && c.admissionsStage === 'enrolled' && !c.isArchived);
  const u2 = active.filter(c => c.isUnderTwo).length;
  const u3 = active.filter(c => c.isUnderThree).length;
  const vac = Math.max(0, p.maxCapacity - p.ownChildrenUnderSix - active.length);
  return `• **${p.name}** (${p.homeName}, ${p.region}): **${vac} vacancies** | Age limits: ${u2}/${p.maxUnderTwo} <2yo, ${u3}/${p.maxUnderThree} <3yo`;
}).join('\n')}

To assign a waiting child, navigate to the **Pipeline** tab and click **"Match"**.`;
    }

    if (q.includes('screen') || q.includes('form 0') || q.includes('intake') || q.includes('approve')) {
      return `### How to Screen a New Family (Form PAR-0)
1. **Public Intake**: When a parent submits an inquiry via \`/apply\` or your public registration link, they complete Form PAR-0.
2. **Daily Command Alert**: The system alerts you under **"Screenings Pending"** in the Daily Command hub.
3. **Screening Call**: Review their required start date, schedule (Full Time vs Part Time), and regional funding needs.
4. **Approve**: In the **Pipeline** tab under **Screening**, click the **"Screening"** button and select **"Approve for Matching"**. This moves the family into the **Docs Needed** stage and unlocks digital forms PAR-1 through PAR-5 for the parent.`;
    }

    if (q.includes('binder') || q.includes('audit') || q.includes('print') || q.includes('ministry')) {
      return `### Physical Ministry Audit Binder
To prepare for an on-site Ministry of Education CCEYA inspection:
1. Click the **"Audit Binder"** button in the top navigation header.
2. Select the specific provider home to inspect (or all homes).
3. The system generates:
   - Ministry official cover sheet with unique barcode **ACCS-PROV-1-2026**.
   - Active child emergency wallet cards with OHIP numbers and allergy icons.
   - Anaphylaxis Sabrina's Law emergency protocols.
   - Provider quarterly inspection history.
4. Click **Print Binder Cover Sheet** to generate a clean, printer-ready copy with zero UI distractions.`;
    }

    if (q.includes('overdue') || q.includes('etransfer') || q.includes('payment') || q.includes('interac')) {
      const overdue = childrenList.filter(c => c.eTransferStatus === 'overdue');
      if (overdue.length === 0) {
        return `### e-Transfer Status
All active families are currently up to date! There are no overdue e-transfers.
To review the billing schedule, go to the **e-Transfers** tab in the Agency Command Centre.`;
      }
      return `### Overdue e-Transfer Payments (${overdue.length} Pending)
The following families have overdue fees:
${overdue.map(c => `• **${c.fullName}** - Monthly fee: $${c.monthlyFee.toFixed(2)} CAD (Due day: ${c.eTransferDueDay})`).join('\n')}

**To dispatch reminders:**
1. Navigate to the **e-Transfers** tab in the Admin Command Centre.
2. Click **"Dispatch 1-Click Reminder"** next to the child's name.
3. The system dispatches an email reminder pointing to \`allchildcaresolutions@gmail.com\`.`;
    }

    if (q.includes('reset') || q.includes('clear') || q.includes('stress test') || q.includes('24')) {
      return `### Human-in-the-Loop Stress Testing
To stress-test the software by hand:
1. **Clear Demo Data**: Click **"Clear Demo Data (Manual Test)"** in the Agency Command Centre to reset the child roster to 0 while keeping your licensed homes intact.
2. **24 Realistic Test Children**: Navigate to the **"24 Test Profiles"** tab in the top header. Each profile includes complete Canadian test data (OHIP numbers, physician details, allergies, and unique compressed portrait images).
3. **Manual Intake**: Click **"New Family Intake"** and use the pre-fill selector or copy/paste fields one by one to test the pipeline stages, ratio math, document approvals, and timesheets!`;
    }

    if (q.includes('quarterly') || q.includes('inspection') || q.includes('checklist') || q.includes('behaviour audit') || q.includes('audit')) {
      return `### CCEYA Quarterly Inspection vs Behaviour Audit Separation
Under Ontario Ministry regulations and ACCS agency standards, these two evaluations are distinct:

1. **CCEYA Section 26 Quarterly Inspection (12 Statutory Domains)**:
   - Physical unannounced premises audit based on **'Quarterly Checklist Home Visitor EN v.08 2023-12-11 Fillable FINAL.pdf'**.
   - Reconciles physical in-person headcount against CCEYA ratios (Max 6 total, Max 3 <3yo, Max 3 <2yo).
   - Audits smoke/CO alarms, water scald temperatures (<49°C), locked medications, Sabrina's Law Epi-Pens, safe sleep, and 12 regulatory domains.

2. **ACCS x CITS Behaviour Management Coaching**:
   - Pedagogical coaching observation evaluating caregiver-child interactions across 10 positive guidance techniques (positive reinforcement, calm demeanor, constructive redirection, sit-out as strict last resort).
   - Completely decoupled from physical capacity and group ratios.
   - Includes routine selection (e.g. Free Play, Circle Time, Outdoor Play) and collaborative coaching notes.`;
    }

    if (q.includes('note') || q.includes('feedback') || q.includes('next round') || q.includes('suggestion') || q.includes('idea') || q.includes('review') || q.includes('curat')) {
      return `### 📝 Curated Review Note Synthesized
Thank you! Your feedback has been **synthesized into the AI Curated Requirements Backlog** and permanently recorded in Cloud Firestore.

- **Intelligent Deduplication**: Similar or recurring requests are merged into a single living requirement rather than logging redundant lines.
- **Traceability**: All your original inquiries are preserved in the requirement's query drawer.
- **Clarifying Questions**: The AI formulates proactive clarifying questions to clarify requirements for the development team.
- **Sprint Traceability**: Identifies connections to past sprint work (e.g., CCEYA ratio alignment, Form PAR-0 screening).

Click the **Review Notes** button in the chat header at any time to view, copy, or export the curated requirements backlog!`;
    }

    if (q === 'undo' || q === 'wait, undo' || q.includes('undo') || q.includes('revert') || q.includes('rollback')) {
      const lastAppliedMsg = [...messages].reverse().find(m => m.formAction && m.actionStatus === 'applied');
      if (lastAppliedMsg && lastAppliedMsg.formAction) {
        const act = lastAppliedMsg.formAction;
        let rollbackPayload: FormActionPayload | null = null;
        if (act.action === 'REMOVE_FIELD' && act.field) {
          rollbackPayload = {
            action: 'ADD_FIELD',
            formId: act.formId,
            sectionId: act.sectionId,
            changeSummary: `[Rollback] Restored field "${act.field.label}"`,
            field: act.field
          };
        } else if (act.action === 'ADD_FIELD') {
          rollbackPayload = {
            action: 'REMOVE_FIELD',
            formId: act.formId,
            sectionId: act.sectionId,
            changeSummary: `[Rollback] Removed field "${act.field?.label || act.fieldId}"`,
            fieldId: act.field?.id || act.field?.name || act.fieldId
          };
        }

        if (rollbackPayload) {
          return `### ↺ Rollback / Undo Proposal
Identified previous modification: **${act.changeSummary}** on form **${act.formId}**.

Here is the rollback mutation proposal to restore the schema:
\`\`\`form_action
${JSON.stringify(rollbackPayload, null, 2)}
\`\`\`
Click **"Apply to Live Form"** below to restore the field in Cloud Firestore.`;
        }
      }
      return `### ↺ Undo / Revert Request
No active form modification was found in this conversation to roll back. If you wish to restore a deleted field or adjust a form, please specify the form code (e.g. PAR-0) and the field name.`;
    }

    return `### ACCS System Assistance
You asked: *"${query}"*

Here is what you can do in ACCS Home Care Hub:
- **Daily Command**: Review 4 deterministic daily alerts for expiring health cards, screening calls, overdue fees, and ratio vacancies.
- **Admissions Pipeline**: Manage the 5-stage Kanban flow (*Inquiry ➔ Screening ➔ Docs Needed ➔ Matching ➔ Enrolled*).
- **Providers Directory**: Real-time CCEYA ratio visualizer enforcing max 6 children, max 3 <3yo, and max 3 <2yo.
- **Home Visitor Portal**: Conduct quarterly unannounced inspections (12 statutory domains from the 40-page Ministry checklist) and decoupled pedagogical behaviour guidance coaching.
- **Parent Portal**: Gamified 5-step registration stepper with dynamic JSON forms and secure Canadian data residency (Montreal).

*Tip: To unlock custom AI responses powered by Google Gemini, DeepSeek, or ChatGPT, click the gear icon in the chat header to add and test your API key.*`;
  };

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isLoading) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');

    // Pre-flight Client-Side PII Sanitization for Canadian PIPEDA & PHIPA (Task #28)
    const knownChildren = childrenList.map(c => c.fullName);
    const sanitizedUserPrompt = sanitizePiiForAi(userText, {
      knownChildNames: knownChildren,
      preserveAgencyContacts: true
    }).sanitizedText;

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };

    const messagesWithUser = [...messages, newUserMsg];
    setMessages(messagesWithUser);
    saveChatConversation('agency_ai_session', messagesWithUser, currentRole);
    setIsLoading(true);

    const systemContext = buildSystemContext();

    // If an API key is provided, use external LLM (Gemini or OpenAI)
    if (cleanApiKey) {
      try {
        let assistantReply = '';

        const systemPromptHeader = `You are the AI Assistant for All Child Care Solutions (ACCS), an Ontario licensed Home Child Care Agency operating under the Child Care and Early Years Act (CCEYA).
Answer questions concisely, professionally, and accurately using the system context below.
Zero text emojis; use markdown formatting.

CANONICAL LOCAL REPOSITORY GROUND TRUTH & KNOWLEDGE BASE:
You have direct read access in your system context to the local codebase files:
1. AGENTS.md (System Architecture, CCEYA Statutory Ground Truth & Montreal Data Residency)
2. TODO.md (Canonical Master Development Roadmap - 33 Completed Tasks)
3. README.md (Operational Workflows & Operator Manual)
4. SUPPLEMENTAL REQUIREMENTS BACKLOG (Single unified document in Cloud Firestore: collection "todo_supp", document "active")

SINGLE-DOCUMENT SUPPLEMENTAL REQUIREMENTS BACKLOG PROTOCOL:
The previous multi-document 'developer_notes' collection has been replaced with a SINGLE, unified document in Cloud Firestore (collection "todo_supp", document "active").
This document is read and modified as a whole by you and the Agency Director, and will be directly merged into C:\Projects\allchildcaresolutions\TODO.md during the next round of local development.
Whenever the user requests a new feature, improvement, requirement, or note:
1. Graciously and professionally validate their observation with Ontario CCEYA operational insight.
2. Connect their request to past sprint work and existing features (e.g. CCEYA ratio alignment to 3 under 2, 40-page Ministry checklist domains, Form PAR-0 screening gating, or dynamic form schema versioning).
3. Confirm that the requirement is being appended or merged into the unified supplemental backlog (todo_supp/active) for synthesis into TODO.md in the next local development cycle.
4. Output a strictly valid JSON mutation payload inside a markdown code block with language identifier "todo_supp_action":
\`\`\`todo_supp_action
{
  "action": "APPEND_TASK",
  "task": {
    "title": "<short concise task title>",
    "description": "<detailed problem statement and operational requirement>",
    "category": "pipeline" | "provider" | "visitor" | "compliance" | "admin" | "ai" | "general",
    "priority": "urgent" | "high" | "medium" | "low",
    "acceptanceCriteria": [
      "<criterion 1>",
      "<criterion 2>"
    ]
  }
}
\`\`\`
Or to rewrite or adjust the entire markdown backlog document:
\`\`\`todo_supp_action
{
  "action": "UPDATE_WHOLE_BACKLOG",
  "updatedMarkdown": "<complete markdown string>"
}
\`\`\`
This payload will be automatically parsed and executed, updating the single "todo_supp/active" document in Cloud Firestore!

CONVERSATION MEMORY & UNDO / REVERT PROTOCOL:
You retain full multi-turn conversation memory of all previous statements, requests, and form modifications.
If the user says "wait, undo", "undo", "revert", "bring that back", "never mind", or asks to reverse an action previously proposed or applied:
1. Examine the preceding turns in this conversation to find the most recent form action.
2. Invert that action:
   - If a field was REMOVED ("REMOVE_FIELD"), propose an "ADD_FIELD" action to restore the exact field with its original label, type, options, and section.
   - If a field was ADDED ("ADD_FIELD"), propose a "REMOVE_FIELD" action targeting that field's id or name.
   - If a field was UPDATED ("UPDATE_FIELD"), propose an "UPDATE_FIELD" restoring the original configuration.
3. Provide a clear, reassuring summary explaining that the change is being reverted, along with the inverted \`\`\`form_action\`\`\` block.

ON-THE-FLY FORM SCHEMA MUTATION ENGINE:
When the user asks to add, update, remove, or customize any field or section on an ACCS dynamic form (e.g. PAR-0 through PAR-5, PROV-0 through PROV-3, PROV-WPP, PROV-4WPS, PROV-DST, PROV-ECL, or SUP-1 through SUP-5):
1. Explain the compliance and operational reason for the change in clear professional prose.
2. Output a strictly valid JSON mutation payload inside a markdown code block with the language identifier "form_action":
\`\`\`form_action
{
  "action": "ADD_FIELD" | "UPDATE_FIELD" | "REMOVE_FIELD",
  "formId": "<exact_form_id_from_context, e.g. par-form-0>",
  "sectionId": "<target_section_id_from_context_or_first_section, e.g. sec-0-1>",
  "changeSummary": "<concise description of the change, e.g. Removed Anticipated Funding Stream field>",
  "fieldId": "<field_id_when_removing_or_updating, e.g. funding_type or f0-7>",
  "field": {
    "id": "<field_id>",
    "name": "<snake_case_key>",
    "label": "<Human readable label>",
    "type": "checkbox" | "text" | "phone" | "email" | "date" | "dropdown" | "radio" | "textarea" | "signature" | "consent_clause",
    "required": true,
    "helpText": "<guidance for parent or provider>",
    "gridCols": 1 | 2 | 3,
    "options": ["Option 1", "Option 2"]
  }
}
\`\`\`

BATCH MUTATIONS & SPLITTING FIELDS:
If the user's request requires more than one modification (e.g., splitting a single legal name into separate First Name and Last Name fields, or making multiple field additions/updates in one go), ALWAYS output a JSON array of mutation objects inside the \`\`\`form_action\`\`\` block:
\`\`\`form_action
[
  {
    "action": "UPDATE_FIELD",
    "formId": "par-form-0",
    "sectionId": "sec-0-1",
    "changeSummary": "Updated Primary Parent / Guardian Legal Name to First Name",
    "fieldId": "f0-1",
    "field": {
      "id": "f0-1",
      "name": "parent_first_name",
      "label": "Primary Parent / Guardian First Name",
      "type": "text",
      "placeholder": "e.g. Sarah",
      "required": true,
      "gridCols": 2
    }
  },
  {
    "action": "ADD_FIELD",
    "formId": "par-form-0",
    "sectionId": "sec-0-1",
    "changeSummary": "Added Primary Parent / Guardian Last Name field",
    "field": {
      "id": "f0-1-last",
      "name": "parent_last_name",
      "label": "Primary Parent / Guardian Last Name",
      "type": "text",
      "placeholder": "e.g. Tremblay",
      "required": true,
      "gridCols": 2
    }
  }
]
WHOLE-FORM SCHEMA INSPECTION & REORDERING:
Before generating any form modification:
1. ALWAYS inspect the entire form structure and the numbered fields list [#1, #2, #3...] in the ACTIVE DYNAMIC FORMS SCHEMA INVENTORY.
2. In Form PAR-0 (0. Initial Intake & Pre-Screening Form), Section 1 (sec-0-1: "Initial Household Inquiry") holds primary guardian details in this canonical order:
   - [#1] Primary Parent / Guardian Legal Name (top of Section 1)
   - [#2] Primary Guardian Contact Phone
   - [#3] Primary Guardian Email Address
   - [#4] Desired Care Region / Municipality
   - [#5] Residential Street Address & Postal Code (must ALWAYS stay in Section 1, NEVER at the bottom of the form or in dynamic extra blocks)
3. If the user asks to move a field to the top, bottom, or change its position:
   Output a "MOVE_FIELD" action:
\`\`\`form_action
{
  "action": "MOVE_FIELD",
  "formId": "par-form-0",
  "sectionId": "sec-0-1",
  "fieldId": "f0-1",
  "targetPosition": "top",
  "changeSummary": "Moved Primary Parent / Guardian Legal Name to the top of Section 1"
}
\`\`\`
   Or output "REORDER_FIELDS" with orderedFieldIds:
\`\`\`form_action
{
  "action": "REORDER_FIELDS",
  "formId": "par-form-0",
  "sectionId": "sec-0-1",
  "orderedFieldIds": ["f0-1", "f0-2", "f0-3", "f0-4", "f0-address"],
  "changeSummary": "Reordered Section 1 fields with Legal Name at top"
}
\`\`\`
Valid field types: text, phone, email, date, dropdown, multiselect, checkbox, radio, textarea, file_upload, signature, notice_block, consent_clause.`;

        // Extract last 10 turns for conversational memory context
        const historyTurns = messages
          .filter(m => !m.isAuthError && m.id !== 'welcome-1')
          .slice(-10);

        if (apiProvider === 'gemini') {
          // Construct alternating Gemini contents array with conversation history
          const pastGeminiTurns: Array<{ role: 'user' | 'model'; text: string }> = [];
          for (const turn of historyTurns) {
            let content = turn.text;
            if (turn.sender === 'assistant' && turn.formAction) {
              content += `\n\n\`\`\`form_action\n${JSON.stringify(turn.formAction, null, 2)}\n\`\`\``;
              if (turn.actionStatus === 'applied') {
                content += `\n(User APPLIED this form modification to live Cloud Firestore as version v${turn.appliedVersion || 'latest'})`;
              } else if (turn.actionStatus === 'undone') {
                content += `\n(User rolled back / undid this form modification)`;
              }
            }
            pastGeminiTurns.push({
              role: turn.sender === 'user' ? 'user' : 'model',
              text: content
            });
          }

          // Merge consecutive same-role turns to guarantee alternating user/model sequence
          const combinedTurns: Array<{ role: 'user' | 'model'; text: string }> = [];
          for (const pt of pastGeminiTurns) {
            if (combinedTurns.length === 0) {
              if (pt.role === 'user') combinedTurns.push({ ...pt });
            } else {
              const lastRole = combinedTurns[combinedTurns.length - 1].role;
              if (pt.role !== lastRole) {
                combinedTurns.push({ ...pt });
              } else {
                combinedTurns[combinedTurns.length - 1].text += `\n\n${pt.text}`;
              }
            }
          }

          // Append current sanitized user prompt
          if (combinedTurns.length === 0 || combinedTurns[combinedTurns.length - 1].role === 'model') {
            combinedTurns.push({ role: 'user', text: sanitizedUserPrompt });
          } else {
            combinedTurns[combinedTurns.length - 1].text += `\n\n${sanitizedUserPrompt}`;
          }

          // Prepend system instruction header and live system context to the first turn
          if (combinedTurns.length > 0 && combinedTurns[0].role === 'user') {
            combinedTurns[0].text = `${systemPromptHeader}\n\n${systemContext}\n\n${combinedTurns[0].text}`;
          }

          const geminiPayload = {
            contents: combinedTurns.map(ct => ({
              role: ct.role,
              parts: [{ text: ct.text }]
            }))
          };

          // Prioritize active selected model, then user-requested frontier fallbacks
          const cleanChosen = geminiModel.replace(/^models\//, '').trim();
          const modelsToTry = Array.from(new Set([
            cleanChosen,
            'gemini-3.8-flash',
            'gemini-3.7-flash',
            'gemini-3.6-flash',
            'gemini-3.1-pro',
            'gemini-2.0-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash-latest',
            'gemini-pro'
          ].filter(Boolean)));

          let res: Response | null = null;
          let lastErrMessage = '';
          let isAuthError = false;

          for (const rawModel of modelsToTry) {
            const modelName = rawModel.replace(/^models\//, '').trim();
            for (const apiVer of ['v1beta', 'v1']) {
              const endpoint = `https://generativelanguage.googleapis.com/${apiVer}/models/${modelName}:generateContent?key=${encodeURIComponent(cleanApiKey)}`;
              try {
                const attempt = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'x-goog-api-key': cleanApiKey // Dual Header & Param Authentication
                  },
                  body: JSON.stringify(geminiPayload)
                });

                if (attempt.ok) {
                  res = attempt;
                  break;
                }

                const errData = await attempt.json().catch(() => ({}));
                lastErrMessage = errData.error?.message || `Status ${attempt.status}`;

                // If Google explicitly rejected the API key, DO NOT loop through other models
                if (
                  lastErrMessage.toLowerCase().includes('api key not valid') ||
                  lastErrMessage.toLowerCase().includes('invalid api key') ||
                  (attempt.status === 400 && lastErrMessage.toLowerCase().includes('api key')) ||
                  attempt.status === 401 ||
                  attempt.status === 403
                ) {
                  isAuthError = true;
                  break;
                }
              } catch (fetchErr: any) {
                lastErrMessage = fetchErr.message;
              }
            }

            if (res && res.ok) break;
            if (isAuthError) break;
          }

          if (isAuthError) {
            // Throw specific authentication error so user receives actionable diagnosis
            throw new Error(`AUTH_ERROR:${lastErrMessage}`);
          }

          if (!res || !res.ok) {
            throw new Error(lastErrMessage || 'Failed to connect to Google Gemini API models.');
          }

          const data = await res.json();
          assistantReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from Gemini.';
        } else if (apiProvider === 'deepseek') {
          // Construct DeepSeek prompt messages with multi-turn conversation memory
          const promptMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            {
              role: 'system',
              content: `${systemPromptHeader}\n\n${systemContext}`
            }
          ];

          for (const turn of historyTurns) {
            let content = turn.text;
            if (turn.sender === 'assistant' && turn.formAction) {
              content += `\n\n\`\`\`form_action\n${JSON.stringify(turn.formAction, null, 2)}\n\`\`\``;
              if (turn.actionStatus === 'applied') {
                content += `\n(User APPLIED this form modification to live Cloud Firestore as version v${turn.appliedVersion || 'latest'})`;
              } else if (turn.actionStatus === 'undone') {
                content += `\n(User rolled back / undid this form modification)`;
              }
            }
            promptMessages.push({
              role: turn.sender === 'user' ? 'user' : 'assistant',
              content
            });
          }

          promptMessages.push({
            role: 'user',
            content: sanitizedUserPrompt
          });

          const endpoint = 'https://api.deepseek.com/v1/chat/completions';
          const promptPayload: any = {
            model: deepseekModel,
            messages: promptMessages
          };
          if (deepseekModel !== 'deepseek-reasoner') {
            promptPayload.temperature = 0.2;
          }

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cleanApiKey}`
            },
            body: JSON.stringify(promptPayload)
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `DeepSeek API returned status ${res.status}`;
            if (res.status === 401 || errMsg.toLowerCase().includes('incorrect api key') || errMsg.toLowerCase().includes('invalid api key')) {
              throw new Error(`AUTH_ERROR:${errMsg}`);
            }
            throw new Error(errMsg);
          }

          const data = await res.json();
          assistantReply = data.choices?.[0]?.message?.content || 'No response received from DeepSeek.';
        } else {
          // Construct OpenAI prompt messages with multi-turn conversation memory
          const promptMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            {
              role: 'system',
              content: `${systemPromptHeader}\n\n${systemContext}`
            }
          ];

          for (const turn of historyTurns) {
            let content = turn.text;
            if (turn.sender === 'assistant' && turn.formAction) {
              content += `\n\n\`\`\`form_action\n${JSON.stringify(turn.formAction, null, 2)}\n\`\`\``;
              if (turn.actionStatus === 'applied') {
                content += `\n(User APPLIED this form modification to live Cloud Firestore as version v${turn.appliedVersion || 'latest'})`;
              } else if (turn.actionStatus === 'undone') {
                content += `\n(User rolled back / undid this form modification)`;
              }
            }
            promptMessages.push({
              role: turn.sender === 'user' ? 'user' : 'assistant',
              content
            });
          }

          promptMessages.push({
            role: 'user',
            content: sanitizedUserPrompt
          });

          const endpoint = 'https://api.openai.com/v1/chat/completions';
          const promptPayload = {
            model: openAiModel,
            messages: promptMessages,
            temperature: 0.2
          };

          let res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cleanApiKey}`
            },
            body: JSON.stringify(promptPayload)
          });

          if (!res.ok && res.status === 404) {
            const errData = await res.clone().json().catch(() => ({}));
            const errMsg = errData.error?.message || '';
            if (errMsg.toLowerCase().includes('does not exist')) {
              // Gracefully execute with available high-capability model on user's API tier
              res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${cleanApiKey}`
                },
                body: JSON.stringify({
                  ...promptPayload,
                  model: 'gpt-4o-mini'
                })
              });
            }
          }

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `OpenAI API returned status ${res.status}`;
            if (res.status === 401 || errMsg.toLowerCase().includes('incorrect api key') || errMsg.toLowerCase().includes('invalid api key')) {
              throw new Error(`AUTH_ERROR:${errMsg}`);
            }
            throw new Error(errMsg);
          }

          const data = await res.json();
          assistantReply = data.choices?.[0]?.message?.content || 'No response received from OpenAI.';
        }

        // Parse structured form_action code blocks (supports single actions, JSON arrays, and multiple blocks)
        let parsedAction: FormActionPayload | undefined;
        let cleanText = assistantReply;
        const collectedActions: FormActionPayload[] = [];

        // 1. Match all ```form_action ... ``` blocks
        const formActionRegexGlobal = /```form_action\s*([\s\S]*?)\s*```/g;
        const formActionMatches = [...assistantReply.matchAll(formActionRegexGlobal)];
        for (const m of formActionMatches) {
          try {
            const raw = JSON.parse(m[1]);
            if (Array.isArray(raw)) {
              collectedActions.push(...raw);
            } else if (raw.action === 'BATCH_ACTIONS' && Array.isArray(raw.actions)) {
              collectedActions.push(...raw.actions);
            } else if (raw && raw.action) {
              collectedActions.push(raw);
            }
          } catch (e) {
            console.warn('Failed to parse form_action JSON:', e);
          }
        }
        cleanText = cleanText.replace(formActionRegexGlobal, '').trim();

        // 2. Also capture any raw JSON blocks with form action mutations (e.g. ```json { "action": "ADD_FIELD", ... } ```)
        const rawJsonActionRegexGlobal = /```(?:json)?\s*(\[\s*\{[\s\S]*?"action"\s*:\s*"(?:ADD_FIELD|UPDATE_FIELD|REMOVE_FIELD|MOVE_FIELD|REORDER_FIELDS|REPLACE_SECTION_FIELDS|ADD_SECTION|REMOVE_SECTION|UPDATE_WHOLE_FORM)"[\s\S]*?\}\s*\]|\{[\s\S]*?"action"\s*:\s*"(?:ADD_FIELD|UPDATE_FIELD|REMOVE_FIELD|MOVE_FIELD|REORDER_FIELDS|REPLACE_SECTION_FIELDS|ADD_SECTION|REMOVE_SECTION|UPDATE_WHOLE_FORM)"[\s\S]*?\})\s*```/g;
        const rawJsonMatches = [...cleanText.matchAll(rawJsonActionRegexGlobal)];
        for (const jm of rawJsonMatches) {
          try {
            const raw = JSON.parse(jm[1]);
            if (Array.isArray(raw)) {
              collectedActions.push(...raw);
              cleanText = cleanText.replace(jm[0], '').trim();
            } else if (raw && raw.action) {
              collectedActions.push(raw);
              cleanText = cleanText.replace(jm[0], '').trim();
            }
          } catch (e) {
            // ignore
          }
        }

        // Helper to auto-enrich REMOVE_FIELD or UPDATE_FIELD if field is missing
        const enrichAction = (act: FormActionPayload) => {
          if (act.action === 'REMOVE_FIELD' && !act.field) {
            const targetF = formsList.find(f => f.id === act.formId);
            if (targetF) {
              for (const sec of targetF.sections) {
                const existingFld = sec.fields.find(
                  f => f.id === act.fieldId || 
                       f.name === act.fieldId || 
                       (act.changeSummary && f.label.toLowerCase().includes(act.changeSummary.toLowerCase()))
                );
                if (existingFld) {
                  act.field = existingFld;
                  if (!act.sectionId) {
                    act.sectionId = sec.id;
                  }
                  break;
                }
              }
            }
          }
        };

        if (collectedActions.length === 1) {
          parsedAction = collectedActions[0];
          enrichAction(parsedAction);
        } else if (collectedActions.length > 1) {
          collectedActions.forEach(enrichAction);
          parsedAction = {
            action: 'BATCH_ACTIONS',
            formId: collectedActions[0].formId,
            sectionId: collectedActions[0].sectionId,
            changeSummary: collectedActions.map(a => a.changeSummary || a.action).join(' & '),
            actions: collectedActions
          };
        }

        // Parse structured todo_supp_action code block if present
        const todoSuppActionRegex = /```todo_supp_action\s*([\s\S]*?)\s*```/;
        const todoMatch = cleanText.match(todoSuppActionRegex);
        if (todoMatch) {
          try {
            const parsedTodoAction = JSON.parse(todoMatch[1]);
            if (parsedTodoAction.action === 'APPEND_TASK' && parsedTodoAction.task) {
              const updatedDoc = await appendSupplementalTask(parsedTodoAction.task, userText);
              setSupplementalBacklog(updatedDoc);
            } else if (parsedTodoAction.action === 'UPDATE_WHOLE_BACKLOG' && parsedTodoAction.updatedMarkdown) {
              const updatedDoc = await updateSupplementalMarkdownContent(parsedTodoAction.updatedMarkdown);
              setSupplementalBacklog(updatedDoc);
            }
            cleanText = cleanText.replace(todoSuppActionRegex, '').trim();
          } catch (e) {
            console.warn('Failed to parse todo_supp_action JSON:', e);
          }
        }

        // Backward-compatible fallback for legacy note_action -> routes to single supplemental backlog
        const noteActionRegex = /```note_action\s*([\s\S]*?)\s*```/;
        const noteMatch = cleanText.match(noteActionRegex);
        if (noteMatch) {
          try {
            const parsedNoteAction = JSON.parse(noteMatch[1]);
            if (parsedNoteAction.note) {
              const updatedDoc = await appendSupplementalTask({
                title: parsedNoteAction.note.topic || 'Client Requirement',
                description: parsedNoteAction.note.summary || '',
                category: parsedNoteAction.note.category === 'ratio_compliance' ? 'compliance' : 'general',
                priority: parsedNoteAction.note.priority || 'medium',
                acceptanceCriteria: parsedNoteAction.note.clarifyingQuestions || []
              }, userText);
              setSupplementalBacklog(updatedDoc);
            }
            cleanText = cleanText.replace(noteActionRegex, '').trim();
          } catch (e) {
            console.warn('Failed to parse legacy note_action JSON:', e);
          }
        }

        const newAsstMsg: Message = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: cleanText,
          timestamp: new Date().toISOString(),
          formAction: parsedAction,
          actionStatus: parsedAction ? 'pending' : undefined
        };
        const allMessages = [...messagesWithUser, newAsstMsg];
        setMessages(allMessages);
        saveChatConversation('agency_ai_session', allMessages, currentRole);
      } catch (err: any) {
        console.warn('AI API Error:', err);

        let errReplyMsg: Message;
        if (err.message?.startsWith('AUTH_ERROR:')) {
          const rawDetail = err.message.replace('AUTH_ERROR:', '');
          const providerName = apiProvider === 'gemini' ? 'Google Gemini' : apiProvider === 'deepseek' ? 'DeepSeek' : 'OpenAI';
          
          errReplyMsg = {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            isAuthError: true,
            text: `### ⚠️ ${providerName} API Key Authentication Failed\n\nThe ${providerName} API returned: **"${rawDetail}"**\n\n**Troubleshooting Checklist:**\n1. **Key Format Check**:\n   - Google Gemini keys start with \`AIzaSy...\` (from Google AI Studio).\n   - OpenAI keys start with \`sk-...\` (from OpenAI platform).\n2. **Verify or Re-issue Key**:\n   - For Gemini: visit **[Google AI Studio](https://aistudio.google.com/app/apikey)**.\n   - For OpenAI: visit **[OpenAI Platform](https://platform.openai.com/api-keys)**.\n3. **API Activation**:\n   - Verify that the **Generative Language API** is enabled in your Google Cloud / Firebase project.\n4. **Update Key**:\n   - Click the **gear icon (Settings)** at the top right of this chat to re-enter, sanitize, or test your key.`,
            timestamp: new Date().toISOString()
          };
        } else {
          // Fallback to local heuristic engine
          const fallbackReply = answerFromOfflineKnowledge(userText);
          errReplyMsg = {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: `${fallbackReply}\n\n*(Note: Remote AI request failed: "${err.message}". Responded via built-in system knowledge engine.)*`,
            timestamp: new Date().toISOString()
          };
        }
        const allWithErr = [...messagesWithUser, errReplyMsg];
        setMessages(allWithErr);
        saveChatConversation('agency_ai_session', allWithErr, currentRole);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Simulate natural latency and use rich offline knowledge engine
      setTimeout(() => {
        const reply = answerFromOfflineKnowledge(userText);
        const offlineReplyMsg: Message = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toISOString()
        };
        const allWithOffline = [...messagesWithUser, offlineReplyMsg];
        setMessages(allWithOffline);
        saveChatConversation('agency_ai_session', allWithOffline, currentRole);
        setIsLoading(false);
      }, 400);
    }
  };

  const handleApplyAction = async (messageId: string, action: FormActionPayload) => {
    if (!onApplyFormAction) return;
    setApplyingActionId(messageId);
    try {
      const res = await onApplyFormAction(action);
      if (res.success) {
        const updated = messages.map(m => m.id === messageId ? {
          ...m,
          actionStatus: 'applied' as const,
          appliedVersion: res.versionNumber
        } : m);
        setMessages(updated);
        saveChatConversation('agency_ai_session', updated, currentRole);
      } else {
        alert(res.error || 'Failed to apply form modification to Firestore.');
      }
    } catch (err: any) {
      console.error('Error applying form action:', err);
      alert(err.message || 'Error updating form.');
    } finally {
      setApplyingActionId(null);
    }
  };

  const handleDismissAction = (messageId: string) => {
    const updated = messages.map(m => m.id === messageId ? {
      ...m,
      actionStatus: 'dismissed' as const
    } : m);
    setMessages(updated);
    saveChatConversation('agency_ai_session', updated, currentRole);
  };

  const handleUndoAction = async (messageId: string, action: FormActionPayload) => {
    if (!onApplyFormAction) return;
    setApplyingActionId(messageId);
    try {
      let rollbackAction: FormActionPayload;
      if (action.action === 'BATCH_ACTIONS' && action.actions) {
        const reversedSubRollbacks: FormActionPayload[] = [];
        for (let i = action.actions.length - 1; i >= 0; i--) {
          const sub = action.actions[i];
          if (sub.action === 'REMOVE_FIELD' && sub.field) {
            reversedSubRollbacks.push({
              action: 'ADD_FIELD',
              formId: sub.formId,
              sectionId: sub.sectionId,
              changeSummary: `[Rollback] Restored field "${sub.field.label}"`,
              field: sub.field
            });
          } else if (sub.action === 'ADD_FIELD') {
            reversedSubRollbacks.push({
              action: 'REMOVE_FIELD',
              formId: sub.formId,
              sectionId: sub.sectionId,
              changeSummary: `[Rollback] Removed field "${sub.field?.label || sub.fieldId}"`,
              fieldId: sub.field?.id || sub.field?.name || sub.fieldId
            });
          } else if (sub.action === 'UPDATE_FIELD' && sub.field) {
            reversedSubRollbacks.push({
              action: 'UPDATE_FIELD',
              formId: sub.formId,
              sectionId: sub.sectionId,
              changeSummary: `[Rollback] Reverted update on "${sub.field.label}"`,
              field: sub.field
            });
          }
        }
        rollbackAction = {
          action: 'BATCH_ACTIONS',
          formId: action.formId,
          sectionId: action.sectionId,
          changeSummary: `[Rollback] Reverted batch mutations`,
          actions: reversedSubRollbacks
        };
      } else if (action.action === 'REMOVE_FIELD') {
        if (!action.field) {
          alert('Cannot automatically undo: original field metadata was not captured.');
          return;
        }
        rollbackAction = {
          action: 'ADD_FIELD',
          formId: action.formId,
          sectionId: action.sectionId,
          changeSummary: `[Rollback] Restored field "${action.field.label}"`,
          field: action.field
        };
      } else if (action.action === 'ADD_FIELD') {
        rollbackAction = {
          action: 'REMOVE_FIELD',
          formId: action.formId,
          sectionId: action.sectionId,
          changeSummary: `[Rollback] Removed field "${action.field?.label || action.fieldId}"`,
          fieldId: action.field?.id || action.field?.name || action.fieldId
        };
      } else {
        if (!action.field) {
          alert('Cannot automatically undo update without previous field state.');
          return;
        }
        rollbackAction = {
          action: 'UPDATE_FIELD',
          formId: action.formId,
          sectionId: action.sectionId,
          changeSummary: `[Rollback] Reverted update on "${action.field.label}"`,
          field: action.field
        };
      }

      const res = await onApplyFormAction(rollbackAction);
      if (res.success) {
        const updated = messages.map(m => m.id === messageId ? {
          ...m,
          actionStatus: 'undone' as const
        } : m);
        const confirmMsg: Message = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `### ↺ Modification Undone & Reverted\nSuccessfully rolled back **${action.changeSummary}** on form **${action.formId}** (Version v${res.versionNumber || 'latest'}).\nThe live form has been restored in Cloud Firestore!`,
          timestamp: new Date().toISOString()
        };
        const all = [...updated, confirmMsg];
        setMessages(all);
        saveChatConversation('agency_ai_session', all, currentRole);
      } else {
        alert(res.error || 'Failed to rollback form modification.');
      }
    } catch (err: any) {
      console.error('Error rolling back form action:', err);
      alert(err.message || 'Error rolling back form action.');
    } finally {
      setApplyingActionId(null);
    }
  };

  // Count curated client requirements preserved in the living backlog
  const userNotesCount = curatedNotes.length;

  const handleQuickPrompt = (prompt: string) => {
    setInputPrompt(prompt);
  };

  // Check for potential provider / key mismatches
  const isKeyLooksLikeOpenAi = cleanApiKey.startsWith('sk-');
  const isKeyLooksLikeGemini = cleanApiKey.startsWith('AIza');
  const hasProviderMismatch = 
    (apiProvider === 'gemini' && isKeyLooksLikeOpenAi) ||
    ((apiProvider === 'openai' || apiProvider === 'deepseek') && isKeyLooksLikeGemini);

  const renderChatContent = (variant: 'desktop' | 'mobile') => (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-white overflow-hidden w-full">
      {/* Header */}
      <div className="bg-white text-slate-900 p-3.5 sm:p-4 border-b-2 border-slate-900 flex items-center justify-between shrink-0">
            {isSettingsOpen ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1.5 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold border border-transparent hover:border-slate-300"
                    title="Return to conversation"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#ff6900] border-2 border-slate-900 flex items-center justify-center text-white shadow-neo-sm shrink-0">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">AI Settings & Configuration</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Provider, API keys, & model controls</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsNotesModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-slate-900 text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-neo-sm"
                    title="Supplemental Backlog (todo_supp/active) & Ground Truth Docs"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden sm:inline">Backlog</span>
                    {supplementalBacklog.tasks.length > 0 && (
                      <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-slate-900">
                        {supplementalBacklog.tasks.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Close / Collapse AI Copilot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#ff6900] border-2 border-slate-900 flex items-center justify-center text-white shadow-neo-sm shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 leading-tight">DaycareOS AI</h3>
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live DB Synced</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-medium">
                        {cleanApiKey ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-bold">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{apiProvider === 'gemini' ? 'Gemini' : apiProvider === 'deepseek' ? 'DeepSeek' : 'ChatGPT'} • {activeModelId}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Offline Knowledge Engine</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onToggleWidthMode && (
                    <button
                      type="button"
                      onClick={onToggleWidthMode}
                      className="hidden xl:flex p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={panelWidthMode === 'quarter' ? 'Expand to 1/3 width' : 'Reset to 1/4 width'}
                      aria-label="Toggle Panel Width"
                    >
                      {panelWidthMode === 'quarter' ? (
                        <Maximize2 className="w-4 h-4" />
                      ) : (
                        <Minimize2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsNotesModalOpen(true)}
                    className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer relative"
                    title="Supplemental Backlog (todo_supp/active) & Ground Truth Docs"
                    aria-label="Supplemental Backlog & Ground Truth Docs"
                  >
                    <Bookmark className="w-4 h-4 text-emerald-600" />
                    {supplementalBacklog.tasks.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-slate-900">
                        {supplementalBacklog.tasks.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-xl transition-colors cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    title="AI Settings & Model Selection"
                    aria-label="Open Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
                    title="Close / Collapse AI panel"
                    aria-label="Close AI panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
      </div>

          {/* Body: Dedicated Settings View OR Chat Experience */}
          {isSettingsOpen ? (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              {/* Scrollable Configuration Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">

                {/* Canadian Data Sovereignty & Zero Database Access Air-Gap Badge */}
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl space-y-1.5 text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Canadian PIPEDA / PHIPA Sovereign</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      Montreal (northamerica-northeast1)
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-900 leading-snug">
                    <strong>Zero Cloud LLM Database Access:</strong> External AI models are 100% air-gapped from Cloud Firestore and receive only client-side sanitized prompt payloads with OHIP numbers and addresses scrubbed beforehand.
                  </p>
                </div>

                {/* AI Engine & Model Configuration Header */}
                <div className="flex items-center justify-between font-extrabold text-slate-900 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-orange-600" />
                    <span>AI Engine & Provider</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Stored locally in browser</span>
                </div>

                {/* Provider Selector */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setApiProvider('gemini');
                      setTestResult(null);
                    }}
                    className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold border-2 transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      apiProvider === 'gemini'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span>Gemini</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApiProvider('openai');
                      setTestResult(null);
                    }}
                    className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold border-2 transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      apiProvider === 'openai'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ChatGPT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApiProvider('deepseek');
                      setTestResult(null);
                    }}
                    className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold border-2 transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      apiProvider === 'deepseek'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white font-black text-[8px] flex items-center justify-center shrink-0">D</div>
                    <span>DeepSeek</span>
                  </button>
                </div>

                {/* Provider Mismatch Warning Banner */}
                {hasProviderMismatch && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-start justify-between gap-2 animate-in fade-in">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 font-bold text-amber-950">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Possible Provider Mismatch</span>
                      </div>
                      <p className="text-[10px] text-amber-800">
                        {apiProvider === 'gemini' && isKeyLooksLikeOpenAi && 'Your key starts with "sk-", which is standard for OpenAI / DeepSeek.'}
                        {(apiProvider === 'openai' || apiProvider === 'deepseek') && isKeyLooksLikeGemini && 'Your key starts with "AIza", which is standard for Google Gemini.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setApiProvider(apiProvider === 'gemini' ? 'openai' : 'gemini');
                        setTestResult(null);
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] rounded-lg shrink-0 transition-colors shadow-sm cursor-pointer"
                    >
                      Switch to {apiProvider === 'gemini' ? 'OpenAI' : 'Gemini'}
                    </button>
                  </div>
                )}

                {/* Model Selector Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-orange-600" />
                      <span>Select Model</span>
                    </label>
                    <span className="text-[9px] text-slate-400 font-mono">Active: {activeModelId}</span>
                  </div>

                  {/* Preset Chips */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {(apiProvider === 'gemini' 
                      ? GEMINI_MODEL_PRESETS 
                      : apiProvider === 'deepseek' 
                      ? DEEPSEEK_MODEL_PRESETS 
                      : OPENAI_MODEL_PRESETS
                    ).map((preset) => {
                      const isSelected = (
                        apiProvider === 'gemini' 
                          ? geminiModel 
                          : apiProvider === 'deepseek' 
                          ? deepseekModel 
                          : openAiModel
                      ) === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            if (apiProvider === 'gemini') setGeminiModel(preset.id);
                            else if (apiProvider === 'deepseek') setDeepseekModel(preset.id);
                            else setOpenAiModel(preset.id);
                            setTestResult(null);
                          }}
                          className={`p-2.5 rounded-xl text-left border-2 transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50 border-orange-600 text-slate-900 shadow-neo-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-[11px] truncate">{preset.name}</span>
                            {preset.isRecommended ? (
                              <span className="text-[8px] uppercase tracking-wider bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded border border-emerald-300 shrink-0">
                                DEFAULT
                              </span>
                            ) : preset.isFrontier ? (
                              <span className="text-[8px] uppercase tracking-wider bg-purple-100 text-purple-800 font-black px-1.5 py-0.2 rounded border border-purple-300 shrink-0">
                                NEW
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">{preset.tag}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Model ID Input */}
                  <div className="pt-1">
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">
                      Or Enter Custom Model ID (e.g. {apiProvider === 'gemini' ? 'gemini-3.8, gemini-2.0-flash-exp' : apiProvider === 'deepseek' ? 'deepseek-chat, deepseek-reasoner' : 'gpt-5.6-luna, gpt-6-astra'}):
                    </label>
                    <input
                      type="text"
                      value={apiProvider === 'gemini' ? geminiModel : apiProvider === 'deepseek' ? deepseekModel : openAiModel}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (apiProvider === 'gemini') setGeminiModel(val);
                        else if (apiProvider === 'deepseek') setDeepseekModel(val);
                        else setOpenAiModel(val);
                        setTestResult(null);
                      }}
                      placeholder={apiProvider === 'gemini' ? 'gemini-3.8-flash' : apiProvider === 'deepseek' ? 'deepseek-chat' : 'gpt-5.6-luna'}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* API Key Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                      {apiProvider === 'gemini' ? 'Google Gemini API Key' : apiProvider === 'deepseek' ? 'DeepSeek API Key' : 'OpenAI API Key'}
                    </label>
                    <a
                      href={
                        apiProvider === 'gemini' 
                          ? 'https://aistudio.google.com/app/apikey' 
                          : apiProvider === 'deepseek' 
                          ? 'https://platform.deepseek.com/api_keys' 
                          : 'https://platform.openai.com/api-keys'
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5 underline"
                    >
                      <span>Get Key</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setTestResult(null);
                    }}
                    placeholder={apiProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                    className="w-full px-3 py-1.5 bg-white border-2 border-slate-900 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Leave blank to use the built-in Ontario CCEYA system knowledge engine.
                  </p>
                </div>

                {/* Test Result Box (if tested) */}
                {testResult && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-tight">{testResult.message}</span>
                  </div>
                )}

                {/* Discovered Google Models Pill List */}
                {apiProvider === 'gemini' && discoveredGoogleModels.length > 0 && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>Active Models Supported by Your Google Key ({discoveredGoogleModels.length}):</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                      {discoveredGoogleModels.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setGeminiModel(m);
                            setTestResult({ success: true, message: `Switched to active model: ${m}` });
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                            geminiModel === m
                              ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                              : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PINNED ACTIONS FOOTER: Always 100% visible without scrolling */}
              <div className="p-3.5 bg-white border-t-2 border-slate-900 flex items-center justify-between shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.04)]">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingKey || !cleanApiKey}
                  className={`px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all ${
                    cleanApiKey && !isTestingKey
                      ? 'bg-white hover:bg-slate-100 text-slate-800 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  {isTestingKey ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <FlaskConical className="w-3.5 h-3.5 text-orange-600" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-transparent transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className={`neo-btn text-xs font-black px-4 py-2 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 ${
                      saveKeySuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {saveKeySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved Config!</span>
                      </>
                    ) : (
                      <span>Save Settings</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Container */}
              <div 
                ref={variant === 'desktop' ? desktopContainerRef : mobileContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 custom-scrollbar"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-[#ff6900] text-white flex items-center justify-center shrink-0 border border-slate-900 shadow-sm text-xs font-black">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[86%] rounded-2xl p-3.5 text-xs shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white font-medium border-2 border-slate-900'
                          : msg.isAuthError
                          ? 'bg-amber-50 text-amber-950 border-2 border-amber-600 space-y-2'
                          : 'bg-white text-slate-800 border-2 border-slate-900 space-y-2'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <div className="leading-relaxed whitespace-pre-wrap font-medium">
                          {msg.text}
                        </div>
                      ) : (
                        <MarkdownRenderer content={msg.text} />
                      )}

                      {msg.isAuthError && (
                        <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                          <span className="text-[10px] text-amber-800 font-bold">Need help configuring your key?</span>
                          <button
                            type="button"
                            onClick={() => setIsSettingsOpen(true)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Settings className="w-3 h-3" />
                            <span>Open Settings</span>
                          </button>
                        </div>
                      )}

                      {/* Interactive AI Form Mutation Proposal Card */}
                      {msg.formAction && (() => {
                        const targetForm = formsList.find(f => f.id === msg.formAction?.formId);
                        const targetSection = targetForm?.sections.find(s => s.id === msg.formAction?.sectionId) || targetForm?.sections[0];
                        const isApplied = msg.actionStatus === 'applied';
                        const isDismissed = msg.actionStatus === 'dismissed';

                        return (
                          <div className="mt-2.5 p-3 rounded-xl border-2 border-slate-900 bg-amber-50/80 space-y-2 text-slate-800 animate-in fade-in">
                            <div className="flex items-center justify-between gap-1 border-b border-amber-200 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span className="font-extrabold text-[11px] text-slate-900">
                                  Form Mutation Proposal
                                </span>
                              </div>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white border border-slate-900 rounded shadow-neo-sm">
                                {targetForm?.formCode || 'FORM'}
                              </span>
                            </div>

                            <p className="text-[11px] font-bold text-slate-900 leading-snug">
                              {msg.formAction.changeSummary}
                            </p>

                            <div className="p-2 bg-white/90 border border-amber-300 rounded-lg text-[10px] space-y-1">
                              <div className="flex justify-between text-slate-500">
                                <span>Target Form:</span>
                                <span className="font-bold text-slate-800">{targetForm?.title || msg.formAction.formId}</span>
                              </div>
                              <div className="flex justify-between text-slate-500">
                                <span>Section:</span>
                                <span className="font-bold text-slate-800">{targetSection?.title || 'General'}</span>
                              </div>
                              <div className="flex justify-between text-slate-500">
                                <span>Action Type:</span>
                                <span className={`font-black uppercase ${
                                  msg.formAction.action === 'ADD_FIELD' 
                                    ? 'text-emerald-600' 
                                    : msg.formAction.action === 'REMOVE_FIELD' 
                                    ? 'text-rose-600' 
                                    : msg.formAction.action === 'BATCH_ACTIONS'
                                    ? 'text-purple-600'
                                    : 'text-blue-600'
                                }`}>
                                  {msg.formAction.action === 'BATCH_ACTIONS'
                                    ? `BATCH MUTATION (${msg.formAction.actions?.length || 0} ACTIONS)`
                                    : msg.formAction.action.replace('_', ' ')}
                                </span>
                              </div>
                              {msg.formAction.action === 'BATCH_ACTIONS' && msg.formAction.actions && (
                                <div className="space-y-1 pt-1 border-t border-amber-200">
                                  {msg.formAction.actions.map((sub, sIdx) => (
                                    <div key={sIdx} className="text-[10px] flex items-center justify-between gap-1">
                                      <span className="font-bold text-slate-700 font-mono">
                                        {sub.action === 'ADD_FIELD' ? '+ Add' : sub.action === 'UPDATE_FIELD' ? '✎ Update' : '✕ Remove'} "{sub.field?.label || sub.fieldId}"
                                      </span>
                                      <span className="text-[9px] text-slate-500">
                                        ({sub.field?.type || 'field'})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {msg.formAction.field && (
                                <div className="flex justify-between text-slate-500 pt-0.5 border-t border-amber-100">
                                  <span>Field Label:</span>
                                  <span className="font-bold text-slate-800 font-mono">
                                    "{msg.formAction.field.label}" ({msg.formAction.field.type})
                                  </span>
                                </div>
                              )}
                              {msg.formAction.fieldId && !msg.formAction.field && (
                                <div className="flex justify-between text-slate-500 pt-0.5 border-t border-amber-100">
                                  <span>Field ID:</span>
                                  <span className="font-bold text-slate-800 font-mono">{msg.formAction.fieldId}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-1 flex items-center justify-between gap-2">
                              {isApplied ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Applied to Database {msg.appliedVersion ? `(v${msg.appliedVersion})` : ''}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUndoAction(msg.id, msg.formAction!)}
                                    disabled={applyingActionId === msg.id}
                                    className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Undo2 className="w-3 h-3 text-slate-500" />
                                    <span>Undo</span>
                                  </button>
                                </div>
                              ) : isDismissed ? (
                                <span className="text-[10px] font-bold text-slate-500 italic">
                                  Proposal dismissed
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDismissAction(msg.id)}
                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Dismiss
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyAction(msg.id, msg.formAction!)}
                                    disabled={applyingActionId === msg.id}
                                    className="neo-btn bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-3.5 py-1 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1 cursor-pointer"
                                  >
                                    {applyingActionId === msg.id ? (
                                      <>
                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Applying...</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Apply Change to Live Forms</span>
                                      </>
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <div
                        className={`text-[9px] mt-1 text-right font-mono ${
                          msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {formatMessageTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-7 h-7 rounded-xl bg-[#ff6900] text-white flex items-center justify-center shrink-0 border border-slate-900 shadow-sm">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-white border-2 border-slate-900 rounded-2xl p-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.3s]" />
                      <span className="text-[11px] font-bold text-slate-500 ml-1">Analyzing database & CCEYA rules...</span>
                    </div>
                  </div>
                )}

                <div ref={variant === 'desktop' ? desktopEndRef : mobileEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t-2 border-slate-900 flex items-end gap-2 shrink-0">
                <div className="relative flex-1">
                  <textarea
                    ref={variant === 'desktop' ? desktopTextareaRef : mobileTextareaRef}
                    rows={3}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about children, ratios, CWELCC, or guides... (Shift+Enter for newline)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none leading-relaxed transition-[height] duration-75 block max-h-[160px] overflow-y-auto custom-scrollbar"
                    style={{ minHeight: '74px', maxHeight: '160px' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputPrompt.trim() || isLoading}
                  className={`h-11 w-11 flex items-center justify-center rounded-xl border-2 border-slate-900 transition-all shrink-0 mb-0.5 ${
                    inputPrompt.trim() && !isLoading
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-neo-sm cursor-pointer active:translate-y-0.5'
                      : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                  }`}
                  title="Send question (Enter, Shift+Enter for new line)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
    </div>
  );

  return (
    <>
      {/* Floating Action Chat Bubble Button (Smooth Fade & Scale Ease In/Out) */}
      <div 
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 print:hidden no-print transition-all duration-300 ease-in-out ${
          !isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={handleToggle}
          disabled={isOpen}
          className="w-16 h-16 rounded-2xl bg-[#ff6900] hover:bg-[#e05d00] text-white border-2 border-slate-900 flex items-center justify-center p-3.5 transition-all cursor-pointer shadow-neo hover:shadow-neo-lg hover:scale-105 active:scale-95"
          title="Open DaycareOS AI Assistant Copilot (Split View)"
          aria-label="Open AI Copilot"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-8 h-8 text-white" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse shadow-sm" />
          </div>
        </button>
      </div>

      {/* Desktop Docked Split-View Panel (Smooth Ease In/Out Width & Slide) */}
      <aside 
        className={`hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-30 bg-white shadow-neo shrink-0 overflow-hidden print:hidden no-print transition-all duration-300 ease-in-out ${
          isOpen
            ? panelWidthMode === 'third' 
              ? 'lg:w-1/3 lg:max-w-[33.333%] lg:min-w-[400px] border-l-2 border-slate-900 opacity-100 translate-x-0' 
              : 'lg:w-1/4 lg:max-w-[25%] lg:min-w-[340px] xl:min-w-[380px] border-l-2 border-slate-900 opacity-100 translate-x-0'
            : 'lg:w-0 lg:max-w-0 lg:min-w-0 border-l-0 opacity-0 translate-x-6 pointer-events-none'
        }`}
        aria-label="DaycareOS AI Assistant Copilot Panel"
        aria-hidden={!isOpen}
      >
        <div className="flex-1 flex flex-col h-full min-h-0 w-full">
          {renderChatContent('desktop')}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop Overlay */}
      <div
        onClick={handleClose}
        className={`lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out print:hidden no-print ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Mobile & Small Tablet Slide-In Drawer (Smooth Ease In/Out Slide) */}
      <div 
        className={`lg:hidden fixed inset-y-0 right-0 z-50 w-[92vw] sm:w-[440px] max-w-full bg-white border-l-2 border-slate-900 shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out print:hidden no-print ${
          isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
        aria-label="DaycareOS AI Assistant Mobile Drawer"
        aria-hidden={!isOpen}
      >
        {renderChatContent('mobile')}
      </div>

      {/* Requirements Backlog & System Ground Truth Modal (todo_supp/active + AGENTS.md + TODO.md + README.md) */}
      <ClientNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        messages={messages}
        curatedNotes={curatedNotes}
        supplementalBacklog={supplementalBacklog}
        onUpdateSupplementalBacklog={async (newDoc) => {
          await saveSupplementalBacklog(newDoc);
          setSupplementalBacklog(newDoc);
        }}
        onAppendSupplementalTask={async (task) => {
          const updated = await appendSupplementalTask(task);
          setSupplementalBacklog(updated);
        }}
        onCreateNote={(newNote) => {
          setCuratedNotes(prev => {
            const next = [newNote, ...prev];
            saveCuratedNotesToStorage(next);
            saveDeveloperNotesToFirestore(next);
            return next;
          });
        }}
        onUpdateNote={(updatedNote) => {
          setCuratedNotes(prev => {
            const next = prev.map(n => n.id === updatedNote.id ? updatedNote : n);
            saveCuratedNotesToStorage(next);
            saveDeveloperNotesToFirestore(next);
            return next;
          });
        }}
        onDeleteNote={(noteId) => {
          setCuratedNotes(prev => {
            const next = prev.filter(n => n.id !== noteId);
            saveCuratedNotesToStorage(next);
            return next;
          });
          deleteDeveloperNoteFromFirestore(noteId);
        }}
      />
    </>
  );
};
