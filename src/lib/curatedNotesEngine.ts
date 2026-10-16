import { CuratedClientNote } from '../types';

export const INITIAL_CURATED_NOTES: CuratedClientNote[] = [
  {
    id: 'note-quarterly-inspection-diff',
    topic: 'Separate Quarterly Inspection from Behaviour Guidance Audit',
    summary: 'Differentiate the physical CCEYA s. 26 premises inspection from the ACCS x CITS pedagogical behaviour guidance observation. Remove irrelevant ratio headcount fields from the behaviour audit and align with the official 10 positive guidance observation checkpoints.',
    category: 'portal_ui',
    priority: 'high',
    status: 'in_progress',
    originalQueries: [
      'i noticed the quaterly inspection and behaviour audit ctas on home visitor portal go to same place?',
      'on home visitor\'s portal page, \'quarterly inspection\' popup is the same as \'beheviour audit\', what\'s up with this? recommendations?'
    ],
    clarifyingQuestions: [
      'Should behaviour audits occur on the exact same date as the physical inspection or during a separate unannounced observation window?',
      'Do you want the supervisor observation notes shared with the provider immediately for collaborative coaching?'
    ],
    relatedPastWork: 'Builds upon the CCEYA ratio alignment to 3 under 2 in the Home Visitor Portal cards and inspection headcount bar.',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'note-40page-cceya-checklist',
    topic: 'Implement 40-Page Ministry Quarterly Checklist (12 Domains)',
    summary: 'Anchor all agency policies and inspection checklists to the Ontario CCEYA statute (14c11) and Ministry Licensing Manual. Implement the official 40-page Ministry Quarterly Checklist (\'Quarterly Checklist Home Visitor EN v.08 2023-12-11\') as an accordion wizard across all 12 regulatory domains.',
    category: 'policies_legal',
    priority: 'urgent',
    status: 'in_progress',
    originalQueries: [
      'we need to make these two ontario websites the source of truth for policy and make sure not to reference these every time.',
      'client said the quarterly report is like a 40 page pdf document that needs to be filled out called \'Quarterly Checklist Home Visitor EN v.08 2023-12-11 Fillable FINAL.pdf\''
    ],
    clarifyingQuestions: [
      'Which of the 12 domains should be marked as mandatory blockers for an unannounced inspection certification?',
      'Should non-compliant items automatically generate a 14-day corrective action reminder for the Home Visitor?'
    ],
    relatedPastWork: 'Directly reinforces the Ontario CCEYA Legal Source of Truth in AGENTS.md and docs/cceya_statutory_source_of_truth.md.',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'note-parent-registration-flow',
    topic: 'Streamline Parent Intake & Registration Flow Gating',
    summary: 'Clarify the prospective family intake flow. Parents register via the 5-stage admissions pipeline: public inquiry via Form PAR-0, Director pre-screening phone interview, automated Magic Link issuance, and parent document uploads (OHIP, Yellow Card).',
    category: 'intake_pipeline',
    priority: 'medium',
    status: 'completed',
    originalQueries: [
      'how do register a child?',
      'what\'s new to do ?'
    ],
    clarifyingQuestions: [
      'Would you like a 1-click guided interactive tour on the public apply link for families?',
      'Should pre-screening phone notes automatically copy over to the child\'s permanent binder card?'
    ],
    relatedPastWork: 'Connects to earlier sprint work removing Anticipated Funding Stream from Form PAR-0 to minimize intake friction.',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'note-form-schema-undo',
    topic: 'Enable Conversational Form Rollback & Version Control',
    summary: 'Enable agency operators to undo form schema mutations or rollback fields modified during conversational AI assistance sessions.',
    category: 'ai_feature',
    priority: 'medium',
    status: 'in_progress',
    originalQueries: [
      'can we undo last change?'
    ],
    clarifyingQuestions: [
      'Should form rollbacks restore only deleted fields, or completely revert all field order and validation rules?',
      'Do you want a visual diff preview before approving a form rollback?'
    ],
    relatedPastWork: 'Extends the Dynamic Form Builder Studio versioning and JSON schema export engine.',
    lastUpdated: new Date().toISOString()
  }
];

const STORAGE_KEY = 'accs_curated_client_notes';

export const loadCuratedNotesFromStorage = (): CuratedClientNote[] => {
  if (typeof window === 'undefined') return INITIAL_CURATED_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CURATED_NOTES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const { consolidated } = consolidateCuratedNotes(parsed);
      return consolidated;
    }
    return INITIAL_CURATED_NOTES;
  } catch {
    return INITIAL_CURATED_NOTES;
  }
};

export const saveCuratedNotesToStorage = (notes: CuratedClientNote[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save curated notes to storage', err);
  }
};

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  // Chat / note command noise words
  'add', 'note', 'notes', 'dev', 'client', 'please', 'make', 'take', 'log', 'feedback', 'regarding', 'inquiry', 'round', 'next'
]);

/**
 * Truncates text cleanly at word boundaries to avoid chopped words like "mor..."
 */
export const truncateAtWordBoundary = (str: string, maxLength: number = 70): string => {
  if (!str || str.length <= maxLength) return str;
  const sub = str.slice(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 25) {
    return sub.slice(0, lastSpace).trim();
  }
  return sub.trim();
};

/**
 * Strips conversational command prefixes from raw prompt strings
 */
export const cleanTopicText = (raw: string): string => {
  if (!raw) return '';
  let text = raw.trim();

  // Strip conversational prefixes like "add to dev notes, ...", "make a note that ...", etc.
  text = text.replace(/^(?:add\s+to\s+dev\s+notes\s*,\s*|add\s+to\s+notes\s*,\s*|add\s+to\s+backlog\s*,\s*|add\s+note\s*:\s*|make\s+a\s+note\s+that\s+|take\s+note\s*:\s*|feedback\s+note(?:\s+for\s+next\s+round)?\s*:\s*|note\s*:\s*|dev\s+notes?\s*:\s*)/i, '');
  text = text.replace(/^(?:client\s+inquiry\s+regarding\s*:\s*|client\s+feedback\s*:\s*)/i, '');
  text = text.replace(/^["']+|["']+$/g, '').trim();

  // Remove trailing ellipsis if copied from truncated display
  text = text.replace(/\.{2,}$/, '').trim();

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }
  return text;
};

/**
 * Transforms raw conversational input into an action-oriented "Do this" imperative title
 * (e.g. "Create...", "Add...", "Restrict...", "Separate...", "Standardize...")
 */
export const formatActionableTitle = (raw: string): string => {
  let t = cleanTopicText(raw);
  if (!t) return 'Review Client Operational Requirement';

  // Specific phrases & conversational fragments to imperative statements
  t = t.replace(/^it'?s\s+(?:only\s+)?for\s+(?:the\s+)?admin(?:\s+only)?(?:,\s*we'?ll\s+talk\s+about\s+format\s+more(?:\s+later)?)?/i, 'Restrict Database Download to Admin Only');
  t = t.replace(/^it'?s\s+(?:only\s+)?for\s+/i, 'Restrict to ');
  t = t.replace(/^for\s+admin\s+only/i, 'Restrict Access to Admin Only');
  t = t.replace(/^(?:we\s+need\s+to|we\s+want\s+to|we\s+should|i\s+need\s+to|i\s+want\s+to|you\s+need\s+to)\s+/i, '');
  t = t.replace(/^(?:can\s+we|could\s+we|can\s+you|could\s+you|please|kindly)\s+/i, '');
  t = t.replace(/^(?:make\s+sure\s+(?:to|that)?|be\s+sure\s+to)\s+/i, 'Ensure ');
  t = t.replace(/^(?:don'?t\s+forget\s+to)\s+/i, 'Ensure ');
  t = t.replace(/^(?:how\s+do\s+(?:we|i)|how\s+to)\s+/i, 'Standardize ');
  t = t.replace(/^(?:what\s+about|what\s+if\s+we)\s+/i, 'Review ');
  t = t.replace(/^(?:also\s+|additionally\s+)/i, '');

  // Strip leading punctuation/quotes
  t = t.replace(/^["'\-–—:]+/, '').trim();

  // Pattern matches for common requests
  if (/^create\s+button\s+to\s+one\s+click\s+download\s+(?:the\s+)?entire\s+firestore\s+database/i.test(t)) {
    return 'Add One-Click Cloud Firestore Database Download for Admin';
  }
  t = t.replace(/^create\s+button\s+to\s+/i, 'Add Button to ');
  t = t.replace(/^one\s+click\s+download\s+/i, 'Add One-Click Download for ');

  // List of recognized imperative action verbs
  const ACTION_VERBS = /^(?:Add|Create|Implement|Build|Restrict|Update|Fix|Configure|Ensure|Separate|Standardize|Remove|Review|Align|Conduct|Verify|Enable|Sync|Export|Import|Download|Upload|Refactor|Design|Automate|Display|Hide|Protect|Integrate|Differentiate|Streamline)\b/i;

  if (!ACTION_VERBS.test(t)) {
    if (/^(?:button|feature|toggle|field|screen|modal|export|download|backup)/i.test(t)) {
      t = `Add ${t}`;
    } else if (/^(?:admin|provider|parent|visitor|role|access)/i.test(t)) {
      t = `Configure ${t}`;
    } else if (/^(?:cceya|policy|ratio|contract|funding)/i.test(t)) {
      t = `Align ${t}`;
    } else {
      t = `Implement ${t}`;
    }
  }

  // Capitalize properly
  t = t.charAt(0).toUpperCase() + t.slice(1);

  // Clean trailing punctuation or ellipses
  t = t.replace(/[\.,\s]+$/, '');

  // Truncate at clean word boundary
  return truncateAtWordBoundary(t, 70);
};

/**
 * Extract clean, normalized keywords from text for semantic comparison
 */
export const extractKeywords = (text: string): Set<string> => {
  if (!text) return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
};

/**
 * Calculate semantic keyword overlap between two texts
 */
export const calculateTokenSimilarity = (textA: string, textB: string): number => {
  const setA = extractKeywords(textA);
  const setB = extractKeywords(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection++;
    }
  }

  const union = new Set([...setA, ...setB]).size;
  const jaccard = union > 0 ? intersection / union : 0;
  const containment = intersection / Math.min(setA.size, setB.size);

  if (containment >= 0.7 && intersection >= 2) return Math.max(jaccard, 0.75);
  return jaccard;
};

/**
 * Check if two CuratedClientNotes refer to the same underlying requirement
 */
export const areNotesDuplicates = (noteA: CuratedClientNote, noteB: CuratedClientNote): boolean => {
  if (noteA.id === noteB.id) return false;

  const cleanA = cleanTopicText(noteA.topic).toLowerCase();
  const cleanB = cleanTopicText(noteB.topic).toLowerCase();

  // 1. Direct topic match
  if (cleanA === cleanB) return true;

  // 2. High semantic token overlap of topics
  const topicSim = calculateTokenSimilarity(noteA.topic, noteB.topic);
  if (topicSim >= 0.5) return true;

  // 3. High semantic token overlap of summaries
  const summarySim = calculateTokenSimilarity(noteA.summary, noteB.summary);
  if (summarySim >= 0.6) return true;

  // 4. Overlap between queries and topics
  for (const q of noteA.originalQueries || []) {
    if (calculateTokenSimilarity(q, noteB.topic) >= 0.6) return true;
  }
  for (const q of noteB.originalQueries || []) {
    if (calculateTokenSimilarity(q, noteA.topic) >= 0.6) return true;
  }

  // 5. Follow-up constraint detection (e.g. database download vs admin/format constraints)
  const textA = `${noteA.topic} ${noteA.summary} ${(noteA.originalQueries || []).join(' ')}`.toLowerCase();
  const textB = `${noteB.topic} ${noteB.summary} ${(noteB.originalQueries || []).join(' ')}`.toLowerCase();

  const isDbExportA = textA.includes('firestore') || textA.includes('database') || textA.includes('download');
  const isDbExportB = textB.includes('firestore') || textB.includes('database') || textB.includes('download');
  const isConstraintA = textA.includes('only for admin') || textA.includes('format mor') || textA.includes('talk about format');
  const isConstraintB = textB.includes('only for admin') || textB.includes('format mor') || textB.includes('talk about format');

  if ((isDbExportA && isConstraintB) || (isDbExportB && isConstraintA)) {
    return true;
  }

  return false;
};

const STATUS_WEIGHT: Record<string, number> = {
  'completed': 4,
  'in_progress': 3,
  'clarification_needed': 2,
  'proposed': 1
};

const PRIORITY_WEIGHT: Record<string, number> = {
  'urgent': 4,
  'high': 3,
  'medium': 2,
  'low': 1
};

/**
 * Intelligently consolidates all curated notes:
 * - Scans all items for duplicates and semantic overlap
 * - Formats all topics into actionable "Do this" imperative statements
 * - Merges queries, clarifying questions, and connection context
 * - Retains progressive status and higher priority
 * - Returns the clean deduplicated array AND the list of duplicate IDs to delete from Firestore
 */
export const consolidateCuratedNotes = (
  notes: CuratedClientNote[]
): { consolidated: CuratedClientNote[]; removedIds: string[] } => {
  if (!notes || notes.length === 0) {
    return { consolidated: [], removedIds: [] };
  }

  const consolidated: CuratedClientNote[] = [];
  const removedIds: string[] = [];

  for (const incoming of notes) {
    const existingIdx = consolidated.findIndex(c => areNotesDuplicates(c, incoming));

    if (existingIdx >= 0) {
      const existing = consolidated[existingIdx];
      removedIds.push(incoming.id);

      const allQueries = Array.from(new Set([
        ...(existing.originalQueries || []),
        ...(incoming.originalQueries || [])
      ]));

      const allQuestions = Array.from(new Set([
        ...(existing.clarifyingQuestions || []),
        ...(incoming.clarifyingQuestions || [])
      ]));

      // Check if this merge includes a database export note and an admin constraint
      const combinedText = `${existing.topic} ${incoming.topic} ${existing.summary} ${incoming.summary}`.toLowerCase();
      let bestTopic: string;
      let bestSummary: string;

      if ((combinedText.includes('database') || combinedText.includes('firestore') || combinedText.includes('download')) && 
          (combinedText.includes('admin') || combinedText.includes('format'))) {
        bestTopic = 'Add One-Click Cloud Firestore Database Download for Admin';
        bestSummary = 'Provide a one-click button in the Admin Command Centre to download the complete Cloud Firestore database backup. Access is strictly restricted to Administrators; export file format details to be finalized during developer consultation.';
        if (!allQuestions.includes('What file format is preferred for the database export (JSON backup or CSV spreadsheet)?')) {
          allQuestions.push('What file format is preferred for the database export (JSON backup or CSV spreadsheet)?');
        }
      } else {
        const candidateTopic = existing.topic.length > 5 && !existing.topic.toLowerCase().startsWith('it\'s only')
          ? existing.topic
          : incoming.topic;
        bestTopic = formatActionableTitle(candidateTopic);
        bestSummary = existing.summary.length >= incoming.summary.length ? existing.summary : incoming.summary;
      }

      // Retain the higher status
      const existingStatusScore = STATUS_WEIGHT[existing.status] || 1;
      const incomingStatusScore = STATUS_WEIGHT[incoming.status] || 1;
      const bestStatus = incomingStatusScore > existingStatusScore ? incoming.status : existing.status;

      // Retain the higher priority
      const existingPriScore = PRIORITY_WEIGHT[existing.priority] || 2;
      const incomingPriScore = PRIORITY_WEIGHT[incoming.priority] || 2;
      const bestPriority = incomingPriScore > existingPriScore ? incoming.priority : existing.priority;

      // Prefer specific category over general
      const bestCategory = existing.category !== 'general' 
        ? existing.category 
        : incoming.category !== 'general' ? incoming.category : 'general';

      // Pick newest timestamp
      const bestTimestamp = new Date(existing.lastUpdated || 0) > new Date(incoming.lastUpdated || 0) 
        ? existing.lastUpdated 
        : incoming.lastUpdated || new Date().toISOString();

      consolidated[existingIdx] = {
        ...existing,
        topic: bestTopic,
        summary: bestSummary,
        category: bestCategory,
        priority: bestPriority,
        status: bestStatus,
        originalQueries: allQueries,
        clarifyingQuestions: allQuestions,
        relatedPastWork: existing.relatedPastWork || incoming.relatedPastWork,
        lastUpdated: bestTimestamp
      };
    } else {
      const actionableTopic = formatActionableTitle(incoming.topic);
      consolidated.push({
        ...incoming,
        topic: actionableTopic
      });
    }
  }

  return { consolidated, removedIds };
};

/**
 * Intelligent Curation Pass:
 * Synthesizes user prompts into existing topics or generates a new curated requirement.
 * All requirements strictly use the "Do this" imperative action title format.
 */
export const synthesizeUserPromptIntoNotes = (
  prompt: string, 
  currentNotes: CuratedClientNote[]
): { notes: CuratedClientNote[]; removedIds: string[] } => {
  // Step 1: Consolidate current backlog first
  const { consolidated, removedIds } = consolidateCuratedNotes(currentNotes);

  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // Filter out low-signal chit-chat
  const lowSignalPhrases = ['hi', 'hello', 'hey', 'test', 'ok', 'okay', 'cool', 'thanks', 'thank you', 'good morning', 'good afternoon'];
  if (lowSignalPhrases.includes(lower) || lower.length < 4) {
    return { notes: consolidated, removedIds };
  }

  const updatedNotes = [...consolidated];
  const cleanedPrompt = cleanTopicText(clean);

  // Step 2: Check for follow-up constraints & qualifications on existing requirements
  const isFollowUpConstraint = 
    lower.startsWith("it's only for") || 
    lower.startsWith("only for") || 
    lower.includes("only for admin") || 
    lower.includes("admin only") || 
    lower.includes("format more later") || 
    lower.includes("talk about format");

  if (isFollowUpConstraint) {
    // Look for a database / download note or top recent note to qualify
    let targetIdx = updatedNotes.findIndex(n => 
      n.topic.toLowerCase().includes('database') || 
      n.topic.toLowerCase().includes('download') || 
      n.topic.toLowerCase().includes('export') ||
      n.summary.toLowerCase().includes('database')
    );
    if (targetIdx < 0 && updatedNotes.length > 0) {
      targetIdx = 0;
    }

    if (targetIdx >= 0) {
      const existing = updatedNotes[targetIdx];
      const newQueries = Array.from(new Set([...(existing.originalQueries || []), clean]));
      const newQuestions = Array.from(new Set([
        ...(existing.clarifyingQuestions || []),
        'What file format is preferred for the database export (JSON backup or CSV spreadsheet)?'
      ]));

      updatedNotes[targetIdx] = {
        ...existing,
        topic: existing.topic.toLowerCase().includes('admin') 
          ? existing.topic 
          : `${existing.topic} for Admin`,
        summary: `${existing.summary} Note: Restricted strictly to Administrator role; export file format details to be finalized during developer consultation.`,
        originalQueries: newQueries,
        clarifyingQuestions: newQuestions,
        lastUpdated: new Date().toISOString()
      };
      return { notes: updatedNotes, removedIds };
    }
  }

  // Step 3: Check for topic matches (hardcoded domains & dynamic notes)
  let matchedIndex = -1;

  if (lower.includes('quarterly') || lower.includes('inspection') || lower.includes('behaviour') || lower.includes('audit')) {
    if (lower.includes('behaviour') && (lower.includes('same') || lower.includes('portal') || lower.includes('cta') || lower.includes('popup'))) {
      matchedIndex = updatedNotes.findIndex(n => n.id === 'note-quarterly-inspection-diff');
    } else if (lower.includes('40 page') || lower.includes('checklist') || lower.includes('ministry') || lower.includes('report')) {
      matchedIndex = updatedNotes.findIndex(n => n.id === 'note-40page-cceya-checklist');
    }
  } else if (lower.includes('register') || lower.includes('child') || lower.includes('enroll') || lower.includes('intake') || lower.includes('admission')) {
    matchedIndex = updatedNotes.findIndex(n => n.id === 'note-parent-registration-flow');
  } else if (lower.includes('undo') || lower.includes('rollback') || lower.includes('revert') || lower.includes('change')) {
    matchedIndex = updatedNotes.findIndex(n => n.id === 'note-form-schema-undo');
  } else if (lower.includes('download') || lower.includes('database') || lower.includes('export') || lower.includes('firestore')) {
    matchedIndex = updatedNotes.findIndex(n => 
      n.topic.toLowerCase().includes('database') || 
      n.topic.toLowerCase().includes('download') || 
      n.summary.toLowerCase().includes('database')
    );
  }

  // If no hardcoded domain match, check against ALL existing notes dynamically
  if (matchedIndex < 0) {
    for (let i = 0; i < updatedNotes.length; i++) {
      const note = updatedNotes[i];
      if (note.originalQueries?.some(q => q.toLowerCase() === lower)) {
        matchedIndex = i;
        break;
      }
      const simWithTopic = calculateTokenSimilarity(cleanedPrompt, note.topic);
      const simWithSummary = calculateTokenSimilarity(cleanedPrompt, note.summary);
      if (simWithTopic >= 0.45 || simWithSummary >= 0.5) {
        matchedIndex = i;
        break;
      }
    }
  }

  if (matchedIndex >= 0) {
    const existing = updatedNotes[matchedIndex];
    if (!existing.originalQueries.includes(clean)) {
      updatedNotes[matchedIndex] = {
        ...existing,
        originalQueries: [...existing.originalQueries, clean],
        lastUpdated: new Date().toISOString()
      };
    }
    return { notes: updatedNotes, removedIds };
  }

  // Step 4: Create a new curated requirement if distinct
  const isQuestion = clean.endsWith('?') || lower.startsWith('how') || lower.startsWith('what') || lower.startsWith('why') || lower.startsWith('can we');
  
  let category: CuratedClientNote['category'] = 'general';
  if (lower.includes('ratio') || lower.includes('cceya') || lower.includes('under 2') || lower.includes('under 3')) {
    category = 'ratio_compliance';
  } else if (lower.includes('visitor') || lower.includes('inspection') || lower.includes('portal') || lower.includes('screen')) {
    category = 'portal_ui';
  } else if (lower.includes('intake') || lower.includes('parent') || lower.includes('pipeline') || lower.includes('enroll')) {
    category = 'intake_pipeline';
  } else if (lower.includes('form') || lower.includes('schema') || lower.includes('builder') || lower.includes('ai')) {
    category = 'ai_feature';
  } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee') || lower.includes('policy') || lower.includes('cwelcc')) {
    category = 'policies_legal';
  }

  const actionableTopic = formatActionableTitle(clean);

  const newNote: CuratedClientNote = {
    id: `note-${Date.now()}`,
    topic: actionableTopic,
    summary: `Client operational requirement: ${actionableTopic}. Evaluated for agency workflow and CCEYA compliance alignment.`,
    category,
    priority: lower.includes('urgent') || lower.includes('critical') || lower.includes('asap') ? 'urgent' : 'high',
    status: isQuestion ? 'clarification_needed' : 'proposed',
    originalQueries: [clean],
    clarifyingQuestions: [
      `What is the preferred operational workflow for this requirement?`,
      `Should this feature be accessible agency-wide or restricted to specific administrative roles?`
    ],
    relatedPastWork: 'Synthesized from live client consultation.',
    lastUpdated: new Date().toISOString()
  };

  return { notes: [newNote, ...updatedNotes], removedIds };
};
