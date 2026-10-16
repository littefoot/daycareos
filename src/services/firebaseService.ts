import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  onSnapshot, 
  writeBatch,
  updateDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Provider, Child, ParentGuardian, DailyActionAlert, HomeVisitor, HomeInspectionRecord, ChatMessageRecord, ChatConversationRecord, CuratedClientNote, AgencyPolicySettings, AttendanceEntry } from '../types';
import { FormTemplate, FormVersionRecord } from '../types/formSchema';
import { 
  INITIAL_PROVIDERS, 
  INITIAL_CHILDREN, 
  INITIAL_PARENTS, 
  INITIAL_HOME_VISITORS,
  INITIAL_INSPECTIONS,
  getProviderPhoto,
  getVisitorPhoto
} from '../data/mockData';
import { ALL_INITIAL_FORMS } from '../data/allFormsData';
import { INITIAL_CURATED_NOTES } from '../lib/curatedNotesEngine';

// Firestore Collection Names
export const COLLECTIONS = {
  PROVIDERS: 'providers',
  HOME_VISITORS: 'home_visitors',
  INSPECTIONS: 'home_inspections',
  CHILDREN: 'children',
  PARENTS: 'parents',
  ALERTS: 'daily_alerts',
  FORMS: 'form_templates',
  SUBMISSIONS: 'form_submissions',
  ATTENDANCE: 'daily_attendance',
  AI_CONVERSATIONS: 'ai_chat_conversations',
  DEVELOPER_NOTES: 'developer_notes',
  TODO_SUPP: 'todo_supp',
  AGENCY_SETTINGS: 'agency_settings'
};

export * from './supplementalTodoService';

/**
 * 1-Click Seeder: Populates Cloud Firestore with full agency dataset:
 * 24 Children, 24 Parents, 6 Providers, 3 Home Visitors, Form Templates, Inspections & Attendance
 */
export async function seedInitialFirestoreData(): Promise<{ success: boolean; message: string }> {
  try {
    const batch = writeBatch(db);

    // Delete legacy form IDs if present
    const legacyFormIds = ['form-0', 'form-1', 'form-2', 'form-3', 'form-4', 'form-5'];
    for (const legacyId of legacyFormIds) {
      const legacyRef = doc(db, COLLECTIONS.FORMS, legacyId);
      batch.delete(legacyRef);
    }

    // 1. Seed Form Templates (10 Parent & Provider Forms with par- and prov- prefixes)
    for (const form of ALL_INITIAL_FORMS) {
      const formRef = doc(db, COLLECTIONS.FORMS, form.id);
      batch.set(formRef, form);
    }

    // 2. Seed 6 Licensed Providers
    for (const provider of INITIAL_PROVIDERS) {
      const provRef = doc(db, COLLECTIONS.PROVIDERS, provider.id);
      batch.set(provRef, provider);
    }

    // 3. Seed 3 Home Visitors
    for (const visitor of INITIAL_HOME_VISITORS) {
      const visRef = doc(db, COLLECTIONS.HOME_VISITORS, visitor.id);
      batch.set(visRef, visitor);
    }

    // 4. Seed Inspections
    for (const insp of INITIAL_INSPECTIONS) {
      const inspRef = doc(db, COLLECTIONS.INSPECTIONS, insp.id);
      batch.set(inspRef, insp);
    }

    // 5. Seed 24 Children
    for (const child of INITIAL_CHILDREN) {
      const childRef = doc(db, COLLECTIONS.CHILDREN, child.id);
      batch.set(childRef, child);
    }

    // 6. Seed 24 Parents
    for (const parent of INITIAL_PARENTS) {
      const parentRef = doc(db, COLLECTIONS.PARENTS, parent.id);
      batch.set(parentRef, parent);
    }

    // 7. Seed Attendance for active enrolled children
    const sampleAttendance: Record<string, { status: string; checkIn: string }> = {
      'child-fam-8': { status: 'present', checkIn: '8:15 AM' },
      'child-fam-12': { status: 'present', checkIn: '8:30 AM' },
      'child-fam-21': { status: 'present', checkIn: '8:45 AM' },
      'child-fam-22': { status: 'present', checkIn: '9:00 AM' },
      'child-fam-10': { status: 'present', checkIn: '8:30 AM' },
      'child-fam-11': { status: 'present', checkIn: '6:45 AM' }
    };

    for (const [childId, att] of Object.entries(sampleAttendance)) {
      const attRef = doc(db, COLLECTIONS.ATTENDANCE, childId);
      batch.set(attRef, {
        childId,
        status: att.status,
        checkIn: att.checkIn,
        checkOut: null,
        updatedAt: new Date().toISOString()
      });
    }

    // 8. Seed Curated Developer Notes (Preserve client notes with merge: true)
    for (const note of INITIAL_CURATED_NOTES) {
      const noteRef = doc(db, COLLECTIONS.DEVELOPER_NOTES, note.id);
      batch.set(noteRef, note, { merge: true });
    }

    await batch.commit();
    return { success: true, message: 'Cloud Firestore successfully seeded with 24 children, 6 providers, 3 visitors, forms, inspections & developer notes!' };
  } catch (error: any) {
    console.error('Error seeding Firestore:', error);
    return { success: false, message: error.message || 'Failed to seed database.' };
  }
}

/**
 * Real-time listener for Form Templates
 */
export function subscribeToForms(callback: (forms: FormTemplate[]) => void) {
  const formsCollection = collection(db, COLLECTIONS.FORMS);
  return onSnapshot(formsCollection, (snapshot) => {
    if (!snapshot.empty) {
      const forms = snapshot.docs.map(doc => doc.data() as FormTemplate);
      callback(forms);
    }
  }, (err) => {
    console.warn('Firestore offline fallback for forms:', err.message);
  });
}

/**
 * Real-time listener for Parents / Families
 */
export function subscribeToParents(callback: (parents: ParentGuardian[]) => void) {
  const parentsCollection = collection(db, COLLECTIONS.PARENTS);
  return onSnapshot(parentsCollection, (snapshot) => {
    if (!snapshot.empty) {
      const parents = snapshot.docs.map(doc => doc.data() as ParentGuardian);
      callback(parents);
    }
  }, (err) => {
    console.warn('Firestore fallback for parents:', err.message);
  });
}

/**
 * Real-time listener for Children
 */
export function subscribeToChildren(callback: (children: Child[]) => void) {
  const childrenCollection = collection(db, COLLECTIONS.CHILDREN);
  return onSnapshot(childrenCollection, (snapshot) => {
    if (!snapshot.empty) {
      const children = snapshot.docs.map(doc => doc.data() as Child);
      callback(children);
    }
  }, (err) => {
    console.warn('Firestore fallback for children:', err.message);
  });
}

/**
 * Real-time listener for Licensed Providers
 */
export function subscribeToProviders(callback: (providers: Provider[]) => void) {
  const providersCollection = collection(db, COLLECTIONS.PROVIDERS);
  return onSnapshot(providersCollection, (snapshot) => {
    if (!snapshot.empty) {
      const providers = snapshot.docs.map(doc => {
        const p = doc.data() as Provider;
        return {
          ...p,
          photoUrl: getProviderPhoto(p)
        };
      });
      callback(providers);
    }
  }, (err) => {
    console.warn('Firestore fallback for providers:', err.message);
  });
}

/**
 * Real-time listener for Home Visitors
 */
export function subscribeToVisitors(callback: (visitors: HomeVisitor[]) => void) {
  const visitorsCollection = collection(db, COLLECTIONS.HOME_VISITORS);
  return onSnapshot(visitorsCollection, (snapshot) => {
    if (!snapshot.empty) {
      const visitors = snapshot.docs.map(doc => {
        const v = doc.data() as HomeVisitor;
        return {
          ...v,
          photoUrl: getVisitorPhoto(v)
        };
      });
      callback(visitors);
    }
  }, (err) => {
    console.warn('Firestore fallback for visitors:', err.message);
  });
}

/**
 * Real-time listener for Home Inspections
 */
export function subscribeToInspections(callback: (inspections: HomeInspectionRecord[]) => void) {
  const inspCollection = collection(db, COLLECTIONS.INSPECTIONS);
  return onSnapshot(inspCollection, (snapshot) => {
    if (!snapshot.empty) {
      const inspections = snapshot.docs.map(doc => doc.data() as HomeInspectionRecord);
      callback(inspections);
    }
  }, (err) => {
    console.warn('Firestore fallback for inspections:', err.message);
  });
}

/**
 * Save / Update a Home Inspection Record in Cloud Firestore
 */
export async function saveInspectionToFirestore(inspection: HomeInspectionRecord): Promise<void> {
  try {
    const cleanInspection = JSON.parse(JSON.stringify(inspection));
    const inspDocRef = doc(db, COLLECTIONS.INSPECTIONS, inspection.id);
    await setDoc(inspDocRef, cleanInspection, { merge: true });
    console.log('[Firestore] Inspection record saved successfully:', inspection.id);
  } catch (error) {
    console.warn('Firestore saveInspection warning:', error);
    throw error;
  }
}

/**
 * Save / Update Form Templates in Firestore
 */
export async function saveFormTemplatesToFirestore(forms: FormTemplate[]) {
  try {
    const batch = writeBatch(db);
    for (const form of forms) {
      const formRef = doc(db, COLLECTIONS.FORMS, form.id);
      batch.set(formRef, form, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    console.error('Error saving forms to Firestore:', error);
  }
}

/**
 * Delete a Form Template from Firestore
 */
export async function deleteFormTemplateFromFirestore(formId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.FORMS, formId));
    console.log(`[Firestore] Form template "${formId}" deleted.`);
  } catch (error) {
    console.error('Error deleting form from Firestore:', error);
  }
}

/**
 * Save / Update a Single Form Template with Append-Only Version Control Snapshot
 */
export async function saveFormVersion(
  form: FormTemplate, 
  changeSummary: string, 
  author: string = 'Agency Director (Admin)'
): Promise<{ success: boolean; versionNumber: number }> {
  try {
    const formRef = doc(db, COLLECTIONS.FORMS, form.id);
    const existingSnap = await getDoc(formRef);

    let prevVersionNumber = 1;
    let existingForm: FormTemplate | null = null;

    if (existingSnap.exists()) {
      existingForm = existingSnap.data() as FormTemplate;
      prevVersionNumber = existingForm.versionNumber || 1;
    }

    // 1. Archive the existing form into subcollection before mutating
    if (existingForm) {
      const versionDocRef = doc(db, COLLECTIONS.FORMS, form.id, 'versions', `v${prevVersionNumber}`);
      const versionRecord: FormVersionRecord = {
        id: `v${prevVersionNumber}`,
        versionNumber: prevVersionNumber,
        versionTag: existingForm.version || `2026.${prevVersionNumber}`,
        timestamp: existingForm.lastUpdated || new Date().toISOString(),
        author: existingForm.lastModifiedBy || 'Previous Version',
        changeSummary: existingForm.changeSummary || 'Historical version snapshot',
        isFactoryDefault: existingForm.versionNumber === 1,
        formSnapshot: existingForm
      };
      await setDoc(versionDocRef, versionRecord);
    }

    // 2. Increment version number for the new active form
    const nextVersionNumber = prevVersionNumber + 1;
    const baseTag = form.version ? form.version.split('.')[0] : '2026';
    const nextVersionTag = `${baseTag}.${nextVersionNumber}`;

    const updatedForm: FormTemplate = {
      ...form,
      versionNumber: nextVersionNumber,
      version: nextVersionTag,
      lastUpdated: new Date().toISOString(),
      lastModifiedBy: author,
      changeSummary: changeSummary || 'Updated form structure'
    };

    // 3. Save as active form
    await setDoc(formRef, updatedForm);

    return { success: true, versionNumber: nextVersionNumber };
  } catch (error) {
    console.error('Error saving form version:', error);
    return { success: false, versionNumber: form.versionNumber || 1 };
  }
}

/**
 * Retrieve all historical version records for a specific form
 */
export async function getFormVersionHistory(formId: string): Promise<FormVersionRecord[]> {
  try {
    const versionsCol = collection(db, COLLECTIONS.FORMS, formId, 'versions');
    const snap = await getDocs(versionsCol);
    
    const records: FormVersionRecord[] = [];
    snap.forEach(docSnap => {
      records.push(docSnap.data() as FormVersionRecord);
    });

    // Also ensure Factory Default baseline is represented if history is young
    const defaultForm = ALL_INITIAL_FORMS.find(f => f.id === formId);
    if (!records.some(r => r.versionNumber === 1) && defaultForm) {
      records.push({
        id: 'v1',
        versionNumber: 1,
        versionTag: defaultForm.version || '2026.1',
        timestamp: '2026-08-27T00:00:00.000Z',
        author: 'Factory Default Baseline',
        changeSummary: 'Original factory default CCEYA compliance schema',
        isFactoryDefault: true,
        formSnapshot: defaultForm
      });
    }

    // Sort descending by versionNumber
    return records.sort((a, b) => b.versionNumber - a.versionNumber);
  } catch (error) {
    console.warn('Error fetching form version history:', error);
    return [];
  }
}

/**
 * Roll back an active form to a specific historical version snapshot
 */
export async function rollbackFormToVersion(
  formId: string, 
  targetVersion: FormVersionRecord, 
  author: string = 'Agency Director (Admin Rollback)'
): Promise<{ success: boolean; newVersion: number }> {
  try {
    const summary = `Rolled back to Version ${targetVersion.versionTag} (${targetVersion.changeSummary || 'Historical State'})`;
    const res = await saveFormVersion(targetVersion.formSnapshot, summary, author);
    return { success: res.success, newVersion: res.versionNumber };
  } catch (error) {
    console.error('Error rolling back form:', error);
    return { success: false, newVersion: 0 };
  }
}

/**
 * 1-Click Factory Default Reset for a specific form
 */
export async function resetFormToFactoryDefault(
  formId: string, 
  author: string = 'Agency Director (Factory Reset)'
): Promise<{ success: boolean; newVersion: number }> {
  try {
    const defaultForm = ALL_INITIAL_FORMS.find(f => f.id === formId);
    if (!defaultForm) {
      throw new Error(`Factory default not found for form ${formId}`);
    }
    const summary = 'Reset to pristine Factory Default CCEYA schema';
    const res = await saveFormVersion(defaultForm, summary, author);
    return { success: res.success, newVersion: res.versionNumber };
  } catch (error) {
    console.error('Error resetting form to factory default:', error);
    return { success: false, newVersion: 0 };
  }
}


/**
 * Save Parent Form Submission to Firestore
 */
export async function submitParentFormToFirestore(
  formId: string, 
  parentId: string, 
  childId: string, 
  submissionData: Record<string, any>
) {
  try {
    const submissionRef = collection(db, COLLECTIONS.SUBMISSIONS);
    await addDoc(submissionRef, {
      formId,
      parentId,
      childId,
      submissionData,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    });
  } catch (error) {
    console.error('Error submitting form to Firestore:', error);
  }
}

/**
 * Real-time listener for Daily Attendance
 */
export function subscribeToAttendance(callback: (records: Record<string, AttendanceEntry>) => void) {
  const attendanceCollection = collection(db, COLLECTIONS.ATTENDANCE);
  return onSnapshot(attendanceCollection, (snapshot) => {
    if (!snapshot.empty) {
      const map: Record<string, AttendanceEntry> = {};
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        map[docSnap.id] = {
          status: data.status || 'not_checked_in',
          checkIn: data.checkIn || undefined,
          checkOut: data.checkOut || undefined,
          pickedUpBy: data.pickedUpBy || undefined,
          netHours: data.netHours !== undefined && data.netHours !== null ? Number(data.netHours) : undefined
        };
      });
      callback(map);
    }
  }, (err) => {
    console.warn('Firestore fallback for attendance:', err.message);
  });
}

/**
 * Save Attendance Record to Cloud Firestore
 */
export async function updateAttendanceInFirestore(
  childId: string, 
  status: string, 
  checkIn?: string, 
  checkOut?: string,
  pickedUpBy?: string,
  netHours?: number
) {
  try {
    const attRef = doc(db, COLLECTIONS.ATTENDANCE, childId);
    await setDoc(attRef, {
      childId,
      status,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      pickedUpBy: pickedUpBy || null,
      netHours: netHours !== undefined ? netHours : null,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore update attendance error:', error);
  }
}

/**
 * Clear All Demo Data from Firestore
 * Deletes children, parents, providers, home visitors, inspections, attendance, and alerts.
 * Resets Firestore database to an absolute clean slate (0 records).
 */
export async function clearAgencyDataToFresh(): Promise<{ success: boolean; message: string }> {
  try {
    const batch = writeBatch(db);

    // 1. Fetch and delete all children
    const childrenSnap = await getDocs(collection(db, COLLECTIONS.CHILDREN));
    childrenSnap.forEach(d => batch.delete(d.ref));

    // 2. Fetch and delete all parents
    const parentsSnap = await getDocs(collection(db, COLLECTIONS.PARENTS));
    parentsSnap.forEach(d => batch.delete(d.ref));

    // 3. Fetch and delete all providers
    const provsSnap = await getDocs(collection(db, COLLECTIONS.PROVIDERS));
    provsSnap.forEach(d => batch.delete(d.ref));

    // 4. Fetch and delete all home visitors
    const visSnap = await getDocs(collection(db, COLLECTIONS.HOME_VISITORS));
    visSnap.forEach(d => batch.delete(d.ref));

    // 5. Fetch and delete all inspections
    const inspSnap = await getDocs(collection(db, COLLECTIONS.INSPECTIONS));
    inspSnap.forEach(d => batch.delete(d.ref));

    // 6. Fetch and delete attendance
    const attSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    attSnap.forEach(d => batch.delete(d.ref));

    // 7. Fetch and delete alerts
    const alertsSnap = await getDocs(collection(db, COLLECTIONS.ALERTS));
    alertsSnap.forEach(d => batch.delete(d.ref));

    await batch.commit();
    return { success: true, message: 'All demo children, parents, providers, visitors, and attendance records wiped from Firestore! Agency reset to clean slate.' };
  } catch (error: any) {
    console.warn('Clear Firestore error (using local reset fallback):', error);
    return { success: false, message: error.message || 'Failed to clear remote data.' };
  }
}

/**
 * AI Chatbot Conversation Persistence in Cloud Firestore
 * Persists the complete multi-turn conversation so the assistant retains memory
 * across reloads, page navigation, and sessions.
 */
export async function saveChatConversation(
  sessionId: string = 'agency_ai_session',
  messages: ChatMessageRecord[],
  role: string = 'admin'
): Promise<void> {
  try {
    // 1. Synchronous localStorage write for zero-latency local retrieval
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`accs_ai_chat_${sessionId}`, JSON.stringify(messages));
      } catch (e) {
        console.warn('LocalStorage chat save warning:', e);
      }
    }

    // 2. Sanitize payload for Firestore (strip undefined keys)
    const sanitizedMessages = JSON.parse(JSON.stringify(messages));

    const chatDocRef = doc(db, COLLECTIONS.AI_CONVERSATIONS, sessionId);
    await setDoc(chatDocRef, {
      id: sessionId,
      role,
      messages: sanitizedMessages,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore saveChatConversation warning:', error);
  }
}

/**
 * Real-time listener for AI Chatbot Conversation
 */
export function subscribeToChatConversation(
  sessionId: string = 'agency_ai_session',
  callback: (messages: ChatMessageRecord[]) => void
) {
  // 1. Immediately hydrate from localStorage cache if available
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`accs_ai_chat_${sessionId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          callback(parsed);
        }
      }
    } catch (e) {
      console.warn('LocalStorage chat hydrate warning:', e);
    }
  }

  // 2. Real-time Firestore snapshot listener
  const chatDocRef = doc(db, COLLECTIONS.AI_CONVERSATIONS, sessionId);
  return onSnapshot(chatDocRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as ChatConversationRecord;
      if (data && Array.isArray(data.messages) && data.messages.length > 0) {
        callback(data.messages);
      }
    }
  }, (err) => {
    console.warn('Firestore chat conversation offline fallback:', err.message);
  });
}

/**
 * Safe Chat Conversation Archive Protocol
 * STRICT PRESERVATION POLICY: ACCS conversation history and client review notes
 * are NEVER deleted from Cloud Firestore. If an archive is requested, a timestamped
 * immutable snapshot is preserved in `ai_conversations_archives` so all client feedback
 * is permanently preserved for review rounds.
 */
export async function archiveChatConversation(
  sessionId: string = 'agency_ai_session',
  messages: ChatMessageRecord[] = []
): Promise<void> {
  try {
    if (messages.length > 0) {
      const archiveId = `${sessionId}_${Date.now()}`;
      const archiveRef = doc(db, 'ai_conversations_archives', archiveId);
      await setDoc(archiveRef, {
        originalSessionId: sessionId,
        archivedAt: new Date().toISOString(),
        messageCount: messages.length,
        messages: JSON.parse(JSON.stringify(messages))
      });
      console.log(`[ACCS History] Conversation safely archived to Firestore as ${archiveId}. Zero Deletion Policy enforced.`);
    }
  } catch (err) {
    console.warn('Firestore archiveChatConversation warning:', err);
  }
}

/**
 * Disarmed clearChatConversation: Zero Deletion Policy protects client review notes in Cloud Firestore.
 * Does not overwrite or clear messages.
 */
export async function clearChatConversation(_sessionId: string = 'agency_ai_session'): Promise<void> {
  console.log('[ACCS History] clearChatConversation blocked: Zero Deletion Policy protects client review notes in Cloud Firestore.');
}

/**
 * Real-time sync for Curated Developer Notes & Client Review Backlog in Firestore.
 * Each requirement is stored as an individual document under the `developer_notes` collection
 * so agency developers and the Agency Director can review the living requirements backlog in the Firebase Console.
 */
export async function saveDeveloperNotesToFirestore(notes: CuratedClientNote[]): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accs_curated_client_notes', JSON.stringify(notes));
      } catch (e) {}
    }

    if (!notes || notes.length === 0) return;

    const batch = writeBatch(db);
    for (const note of notes) {
      const sanitizedNote = JSON.parse(JSON.stringify(note));
      const noteRef = doc(db, COLLECTIONS.DEVELOPER_NOTES, note.id);
      batch.set(noteRef, {
        ...sanitizedNote,
        lastUpdated: note.lastUpdated || new Date().toISOString()
      }, { merge: true });
    }
    await batch.commit();
    console.log(`[ACCS History] Synchronized ${notes.length} curated developer notes to Cloud Firestore collection "${COLLECTIONS.DEVELOPER_NOTES}".`);
  } catch (err) {
    console.warn('Firestore saveDeveloperNotesToFirestore warning:', err);
  }
}

/**
 * Real-time listener for Curated Developer Notes from Firestore.
 */
export function subscribeToDeveloperNotes(callback: (notes: CuratedClientNote[]) => void) {
  const notesCol = collection(db, COLLECTIONS.DEVELOPER_NOTES);
  return onSnapshot(notesCol, (snapshot) => {
    if (!snapshot.empty) {
      const notes = snapshot.docs.map(doc => doc.data() as CuratedClientNote);
      callback(notes);
    }
  }, (err) => {
    console.warn('Firestore developer_notes listener fallback:', err.message);
  });
}

/**
 * Save or update a single developer note in Cloud Firestore
 */
export async function saveSingleDeveloperNoteToFirestore(note: CuratedClientNote): Promise<void> {
  try {
    const noteRef = doc(db, COLLECTIONS.DEVELOPER_NOTES, note.id);
    const sanitized = JSON.parse(JSON.stringify(note));
    await setDoc(noteRef, {
      ...sanitized,
      lastUpdated: note.lastUpdated || new Date().toISOString()
    }, { merge: true });
    console.log(`[ACCS History] Preserved developer note "${note.topic}" in Cloud Firestore.`);
  } catch (err) {
    console.warn('Firestore saveSingleDeveloperNoteToFirestore warning:', err);
  }
}

/**
 * Delete a single developer note from Cloud Firestore
 */
export async function deleteDeveloperNoteFromFirestore(noteId: string): Promise<void> {
  try {
    const noteRef = doc(db, COLLECTIONS.DEVELOPER_NOTES, noteId);
    await deleteDoc(noteRef);
    console.log(`[ACCS History] Removed developer note ${noteId} from Cloud Firestore.`);
  } catch (err) {
    console.warn('Firestore deleteDeveloperNoteFromFirestore warning:', err);
  }
}

/**
 * Save agency policy & compliance settings to Cloud Firestore.
 */
export async function saveAgencySettingsToFirestore(settings: AgencyPolicySettings): Promise<void> {
  try {
    const settingsRef = doc(db, COLLECTIONS.AGENCY_SETTINGS, 'compliance_policy');
    const sanitized = JSON.parse(JSON.stringify(settings));
    await setDoc(settingsRef, {
      ...sanitized,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    console.log('[ACCS Settings] Saved policy & rates settings to Cloud Firestore (/agency_settings/compliance_policy).');
  } catch (err) {
    console.warn('Firestore saveAgencySettingsToFirestore warning:', err);
  }
}

/**
 * Load agency policy & compliance settings from Cloud Firestore.
 */
export async function fetchAgencySettingsFromFirestore(): Promise<AgencyPolicySettings | null> {
  try {
    const settingsRef = doc(db, COLLECTIONS.AGENCY_SETTINGS, 'compliance_policy');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as AgencyPolicySettings;
    }
  } catch (err) {
    console.warn('Firestore fetchAgencySettingsFromFirestore warning:', err);
  }
  return null;
}

/**
 * Real-time listener for Agency Policy & Compliance Settings from Cloud Firestore.
 */
export function subscribeToAgencySettings(callback: (settings: AgencyPolicySettings) => void) {
  const settingsRef = doc(db, COLLECTIONS.AGENCY_SETTINGS, 'compliance_policy');
  return onSnapshot(settingsRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as AgencyPolicySettings;
      callback(data);
    }
  }, (err) => {
    console.warn('Firestore agency_settings listener fallback:', err.message);
  });
}



