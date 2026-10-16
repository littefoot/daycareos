import { GatedNote } from '../types/notes';

export const INITIAL_GATED_NOTES: GatedNote[] = [
  // Oliver Wright (child-1) - Fatima's Home (prov-1)
  {
    id: 'note-101',
    targetType: 'child',
    targetId: 'child-1',
    targetName: 'Oliver Wright',
    authorId: 'parent-1',
    authorName: 'Marcus & Sarah Wright',
    authorRole: 'parent',
    authorInitials: 'SW',
    type: 'external',
    visibilityTier: 'parents_and_staff',
    category: 'pickup_custody',
    title: 'Grandmother Pick-up Today',
    content: 'Hi Fatima! Grandma Susan will be picking up Oliver at 4:15 PM today instead of me. She is on the authorized emergency contact list and will carry photo ID.',
    createdAt: '2026-10-02T13:30:00Z',
    isPinned: true
  },
  {
    id: 'note-102',
    targetType: 'child',
    targetId: 'child-1',
    targetName: 'Oliver Wright',
    authorId: 'prov-1',
    authorName: 'Fatima Al-Mansoor',
    authorRole: 'provider',
    authorInitials: 'FA',
    type: 'external',
    visibilityTier: 'parents_and_staff',
    category: 'daily_care',
    title: 'Lunch & Nap Log',
    content: 'Oliver ate all of his steamed carrots and chicken rice bowl today! Napped soundly from 12:45 PM to 2:30 PM. Great mood outdoors during morning sandbox play.',
    createdAt: '2026-10-02T15:00:00Z'
  },
  {
    id: 'note-103',
    targetType: 'child',
    targetId: 'child-1',
    targetName: 'Oliver Wright',
    authorId: 'prov-1',
    authorName: 'Fatima Al-Mansoor',
    authorRole: 'provider',
    authorInitials: 'FA',
    type: 'internal',
    visibilityTier: 'provider_team',
    category: 'daily_care',
    title: 'Speech & Language Milestone Observation',
    content: 'Observed Oliver using two-word phrases consistently during block play today. Flagging for Sabrina (RECE Visitor) to review speech development checklist on her next visit.',
    createdAt: '2026-10-01T16:15:00Z'
  },
  {
    id: 'note-104',
    targetType: 'child',
    targetId: 'child-1',
    targetName: 'Oliver Wright',
    authorId: 'visitor-1',
    authorName: 'Sabrina Vance, RECE #44192',
    authorRole: 'visitor',
    authorInitials: 'SV',
    type: 'internal',
    visibilityTier: 'visitor_and_admin',
    category: 'compliance_audit',
    title: 'Quarterly Child Dossier & Attendance Audit',
    content: 'Reviewed Oliver\'s file during Q3 unannounced inspection. Daily digital sign-ins match physical headcount accurately. Yellow immunization card is valid until next year. No regulatory concerns.',
    createdAt: '2026-09-28T14:20:00Z'
  },
  {
    id: 'note-105',
    targetType: 'child',
    targetId: 'child-1',
    targetName: 'Oliver Wright',
    authorId: 'admin-1',
    authorName: 'Agency Director',
    authorRole: 'admin',
    authorInitials: 'JB',
    type: 'internal',
    visibilityTier: 'admin_only',
    category: 'general',
    title: 'Municipal Fee Subsidy Verification',
    content: 'Confirmed Durham Region child care subsidy renewal with regional caseworker. Co-pay remains $0.00/day. Master parent contract and annual fee terms fully approved.',
    createdAt: '2026-09-15T11:00:00Z'
  },

  // Fatima Al-Mansoor (prov-1) - Provider Home Notes
  {
    id: 'note-201',
    targetType: 'provider',
    targetId: 'prov-1',
    targetName: 'Fatima Al-Mansoor (Oshawa Central)',
    authorId: 'visitor-1',
    authorName: 'Sabrina Vance, RECE #44192',
    authorRole: 'visitor',
    authorInitials: 'SV',
    type: 'internal',
    visibilityTier: 'provider_team',
    category: 'compliance_audit',
    title: 'Quarterly Safety Audit & Evacuation Drill',
    content: 'Completed unannounced quarterly inspection. Kitchen safety locks verified, fire extinguishers certified, outdoor fenced play area secure. Fatima conducted a calm 2-minute fire drill with all 5 present children.',
    createdAt: '2026-09-28T15:30:00Z',
    isPinned: true
  },
  {
    id: 'note-202',
    targetType: 'provider',
    targetId: 'prov-1',
    targetName: 'Fatima Al-Mansoor (Oshawa Central)',
    authorId: 'visitor-1',
    authorName: 'Sabrina Vance, RECE #44192',
    authorRole: 'visitor',
    authorInitials: 'SV',
    type: 'internal',
    visibilityTier: 'visitor_and_admin',
    category: 'compliance_audit',
    title: 'Confidential Ratio & Premises Caseload Review',
    content: 'Confirmed Fatima\'s own school-aged child attends full-day grade school and only arrives after 3:45 PM. During morning core hours, provider cares for 5 children (2 toddlers, 1 infant, 2 preschoolers), which strictly satisfies CCEYA s. 8 ratios.',
    createdAt: '2026-09-28T16:00:00Z'
  },
  {
    id: 'note-203',
    targetType: 'provider',
    targetId: 'prov-1',
    targetName: 'Fatima Al-Mansoor (Oshawa Central)',
    authorId: 'admin-1',
    authorName: 'Agency Director',
    authorRole: 'admin',
    authorInitials: 'JB',
    type: 'internal',
    visibilityTier: 'admin_only',
    category: 'general',
    title: 'Annual CCEYA Licensing Review & Insurance Renewal',
    content: 'Commercial general liability policy certificate verified and renewed. T4A remuneration for 2026 pre-calculated on target. Provider in excellent standing with the agency.',
    createdAt: '2026-09-10T10:15:00Z'
  }
];

const STORAGE_KEY = 'accs_gated_notes';

export function loadGatedNotes(): GatedNote[] {
  if (typeof window === 'undefined') return INITIAL_GATED_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GATED_NOTES));
      return INITIAL_GATED_NOTES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load gated notes from localStorage:', err);
    return INITIAL_GATED_NOTES;
  }
}

export function saveGatedNotes(notes: GatedNote[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save gated notes to localStorage:', err);
  }
}

export function addGatedNote(noteData: Omit<GatedNote, 'id' | 'createdAt'>): GatedNote {
  const all = loadGatedNotes();
  const newNote: GatedNote = {
    ...noteData,
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newNote, ...all];
  saveGatedNotes(updated);
  return newNote;
}

export function deleteGatedNote(noteId: string): void {
  const all = loadGatedNotes();
  const updated = all.filter(n => n.id !== noteId);
  saveGatedNotes(updated);
}
