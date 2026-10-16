/**
 * Supplemental Requirements Backlog Service (`todo_supp/active`)
 * ---------------------------------------------------------------
 * Solves the disjointed notes problem by centralizing all future client review notes,
 * requirements, and feature requests into a SINGLE, unified document in Cloud Firestore:
 * collection: `todo_supp`, document: `active`.
 *
 * This supplemental file is read and modified as a whole by the ACCS AI Copilot and agency staff,
 * designed to be merged directly into `C:\Projects\allchildcaresolutions\TODO.md` during each
 * subsequent round of local development.
 *
 * The legacy `developer_notes` collection is preserved untouched for historical reference.
 */

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SupplementalTodoItem {
  id: string; // e.g. "supp-1"
  title: string;
  description: string;
  category: 'pipeline' | 'provider' | 'visitor' | 'compliance' | 'admin' | 'ai' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  originalUserPrompt?: string;
  acceptanceCriteria?: string[];
}

export interface SupplementalBacklogDoc {
  id: string; // 'active'
  title: string;
  markdownContent: string;
  tasks: SupplementalTodoItem[];
  lastUpdated: string;
  updatedBy: string;
  version: number;
}

export const SUPPLEMENTAL_COLLECTION = 'todo_supp';
export const SUPPLEMENTAL_DOC_ID = 'active';

export const INITIAL_SUPPLEMENTAL_BACKLOG: SupplementalBacklogDoc = {
  id: SUPPLEMENTAL_DOC_ID,
  title: 'ACCS Supplemental Requirements Backlog',
  markdownContent: `# Supplemental Requirements Backlog (ACCS Hub)
> Real-time unified backlog updated by Agency Director and ACCS AI Copilot.
> Stored in Cloud Firestore as a single document (\`todo_supp/active\`).
> Prepared for direct synthesis into \`TODO.md\` during the next local development cycle.

---

## 📌 Active Supplemental Tasks (Ready for Next Dev Cycle)

*(No supplemental tasks recorded yet. Share any feature requests, workflow tweaks, or feedback in the AI Copilot to automatically append to this unified backlog.)*

---

## 💡 Local Development Integration Notes
- **Master Backlog**: Tasks #1 through #30, #4B, #18B, #18C are 100% completed in \`TODO.md\`.
- **Merge Protocol**: When beginning a new local development session, review this document, merge approved tasks into \`TODO.md\`, and reset or archive completed items.
`,
  tasks: [],
  lastUpdated: new Date().toISOString(),
  updatedBy: 'System Initializer',
  version: 1
};

const LOCAL_STORAGE_KEY = 'accs_todo_supp_active';

/**
 * Load supplemental backlog from localStorage cache
 */
export function loadSupplementalBacklogFromStorage(): SupplementalBacklogDoc {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed.id === SUPPLEMENTAL_DOC_ID) {
          return parsed as SupplementalBacklogDoc;
        }
      }
    } catch (e) {
      console.warn('Failed to load supplemental backlog from localStorage:', e);
    }
  }
  return INITIAL_SUPPLEMENTAL_BACKLOG;
}

/**
 * Save supplemental backlog to localStorage cache
 */
export function saveSupplementalBacklogToStorage(docData: SupplementalBacklogDoc): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docData));
    } catch (e) {
      console.warn('Failed to save supplemental backlog to localStorage:', e);
    }
  }
}

/**
 * Rebuild markdownContent string from the tasks array and metadata
 */
export function generateSupplementalMarkdown(tasks: SupplementalTodoItem[], version: number): string {
  const header = `# Supplemental Requirements Backlog (ACCS Hub)
> Real-time unified backlog updated by Agency Director and ACCS AI Copilot.
> Stored in Cloud Firestore as a single document (\`todo_supp/active\`).
> Prepared for direct synthesis into \`TODO.md\` during the next local development cycle.
> Version: v${version} • Last Updated: ${new Date().toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}

---

## 📌 Active Supplemental Tasks (Total: ${tasks.length})

`;

  if (tasks.length === 0) {
    return header + `*(No supplemental tasks recorded yet. Chat with the AI Copilot to append or revise requirements.)*\n\n---\n\n## 💡 Local Development Integration Notes\n- Master backlog in \`TODO.md\` tracks 33 completed tasks.\n- Items in this supplemental backlog will be merged into \`TODO.md\` during the next local coding session.\n`;
  }

  const taskSections = tasks.map((task, idx) => {
    const priorityBadge = task.priority === 'urgent' ? '🚨 [URGENT]' : task.priority === 'high' ? '🔥 [HIGH]' : task.priority === 'medium' ? '⚡ [MEDIUM]' : '📝 [LOW]';
    const statusBadge = task.status === 'completed' ? '✅ [COMPLETED]' : task.status === 'in_progress' ? '🔄 [IN PROGRESS]' : '⏳ [PENDING]';
    const categoryBadge = `Domain: ${task.category.toUpperCase()}`;

    let section = `### Supplemental Item #${idx + 1}: ${task.title}
- **Status & Priority**: ${statusBadge} • ${priorityBadge} • ${categoryBadge}
- **Problem / Need**: ${task.description}
`;

    if (task.originalUserPrompt) {
      section += `- **Original User Request**: "${task.originalUserPrompt}"\n`;
    }

    if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
      section += `- **Acceptance Criteria**:\n` + task.acceptanceCriteria.map((c, cIdx) => `  - ${cIdx + 1}. ${c}`).join('\n') + '\n';
    }

    section += `- **Added**: ${task.createdAt.split('T')[0]}\n`;
    return section;
  }).join('\n---\n\n');

  const footer = `\n---\n\n## 💡 Next Local Development Cycle Protocol
1. Open Antigravity IDE and inspect \`todo_supp/active\`.
2. Append or merge the verified items above into \`C:\\Projects\\daycare-os\\TODO.md\`.
3. Implement the feature and mark completed.
`;

  return header + taskSections + footer;
}

/**
 * Fetch the single supplemental backlog document from Cloud Firestore
 */
export async function fetchSupplementalBacklog(): Promise<SupplementalBacklogDoc> {
  try {
    const docRef = doc(db, SUPPLEMENTAL_COLLECTION, SUPPLEMENTAL_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SupplementalBacklogDoc;
      saveSupplementalBacklogToStorage(data);
      return data;
    } else {
      // Initialize with default template if not found
      await setDoc(docRef, INITIAL_SUPPLEMENTAL_BACKLOG);
      saveSupplementalBacklogToStorage(INITIAL_SUPPLEMENTAL_BACKLOG);
      return INITIAL_SUPPLEMENTAL_BACKLOG;
    }
  } catch (err) {
    console.warn('Failed to fetch todo_supp/active from Firestore, using local cache:', err);
    return loadSupplementalBacklogFromStorage();
  }
}

/**
 * Save or overwrite the entire supplemental backlog document in Cloud Firestore
 */
export async function saveSupplementalBacklog(docData: SupplementalBacklogDoc): Promise<void> {
  const updatedDoc: SupplementalBacklogDoc = {
    ...docData,
    id: SUPPLEMENTAL_DOC_ID,
    lastUpdated: new Date().toISOString(),
    version: (docData.version || 1) + 1
  };

  saveSupplementalBacklogToStorage(updatedDoc);

  try {
    const docRef = doc(db, SUPPLEMENTAL_COLLECTION, SUPPLEMENTAL_DOC_ID);
    await setDoc(docRef, updatedDoc, { merge: false });
    console.log(`[ACCS Backlog] Preserved unified supplemental backlog v${updatedDoc.version} in Firestore collection "todo_supp".`);
  } catch (err) {
    console.error('Failed to save todo_supp/active in Firestore:', err);
  }
}

/**
 * Append a new task to the single supplemental backlog document
 */
export async function appendSupplementalTask(
  taskInput: {
    title: string;
    description: string;
    category?: 'pipeline' | 'provider' | 'visitor' | 'compliance' | 'admin' | 'ai' | 'general';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    acceptanceCriteria?: string[];
  },
  originalPrompt?: string,
  author: string = 'Agency Director via AI Copilot'
): Promise<SupplementalBacklogDoc> {
  const current = await fetchSupplementalBacklog();
  const now = new Date().toISOString();
  
  const newTask: SupplementalTodoItem = {
    id: `supp-${Date.now()}`,
    title: taskInput.title,
    description: taskInput.description,
    category: taskInput.category || 'general',
    priority: taskInput.priority || 'medium',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    originalUserPrompt: originalPrompt,
    acceptanceCriteria: taskInput.acceptanceCriteria || [
      'Verify requirements match client directive.',
      'Implement in next local dev cycle and update TODO.md.'
    ]
  };

  const updatedTasks = [...current.tasks, newTask];
  const newVersion = (current.version || 1) + 1;
  const newMarkdown = generateSupplementalMarkdown(updatedTasks, newVersion);

  const updatedDoc: SupplementalBacklogDoc = {
    ...current,
    tasks: updatedTasks,
    markdownContent: newMarkdown,
    lastUpdated: now,
    updatedBy: author,
    version: newVersion
  };

  await saveSupplementalBacklog(updatedDoc);
  return updatedDoc;
}

/**
 * Update the full markdown content of the supplemental backlog directly
 */
export async function updateSupplementalMarkdownContent(
  newMarkdown: string,
  author: string = 'Agency Director'
): Promise<SupplementalBacklogDoc> {
  const current = await fetchSupplementalBacklog();
  const now = new Date().toISOString();
  const newVersion = (current.version || 1) + 1;

  const updatedDoc: SupplementalBacklogDoc = {
    ...current,
    markdownContent: newMarkdown,
    lastUpdated: now,
    updatedBy: author,
    version: newVersion
  };

  await saveSupplementalBacklog(updatedDoc);
  return updatedDoc;
}

/**
 * Real-time listener for the single supplemental backlog document
 */
export function subscribeToSupplementalBacklog(callback: (doc: SupplementalBacklogDoc) => void): () => void {
  try {
    const docRef = doc(db, SUPPLEMENTAL_COLLECTION, SUPPLEMENTAL_DOC_ID);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SupplementalBacklogDoc;
        saveSupplementalBacklogToStorage(data);
        callback(data);
      } else {
        // If not exists, initialize
        setDoc(docRef, INITIAL_SUPPLEMENTAL_BACKLOG).catch(() => {});
        callback(INITIAL_SUPPLEMENTAL_BACKLOG);
      }
    }, (err) => {
      console.warn('Firestore todo_supp/active listener fallback:', err.message);
      callback(loadSupplementalBacklogFromStorage());
    });
  } catch (err) {
    console.warn('Could not initialize todo_supp listener, using local cache:', err);
    callback(loadSupplementalBacklogFromStorage());
    return () => {};
  }
}
