import { UserRole, Child, Provider } from './index';

export type NoteTargetType = 'child' | 'provider';

export type NoteCategory = 
  | 'general' 
  | 'daily_care' 
  | 'health_medical' 
  | 'pickup_custody' 
  | 'incident' 
  | 'compliance_audit';

export type NoteType = 'external' | 'internal';

export type NoteVisibilityTier = 
  | 'parents_and_staff'   // EXTERNAL: Parent + Caregiver + Visitor + Admin
  | 'provider_team'       // INTERNAL: Provider + Assigned Visitor + Admin
  | 'visitor_and_admin'   // INTERNAL: Assigned Visitor + Admin only (hidden from Provider & Parent)
  | 'admin_only';         // INTERNAL: Admin / Director only (hidden from Field Staff & Parent)

export interface GatedNote {
  id: string;
  targetType: NoteTargetType;
  targetId: string;               // childId or providerId
  targetName?: string;            // Denormalized name for fast listing (e.g. "Ananya Sharma")
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorInitials?: string;
  type: NoteType;
  visibilityTier: NoteVisibilityTier;
  category: NoteCategory;
  title?: string;
  content: string;
  createdAt: string;              // ISO 8601 string
  updatedAt?: string;
  isPinned?: boolean;
}

export interface NoteUserContext {
  role: UserRole;
  userId: string;
  userName: string;
  assignedProviderIds?: string[]; // For Home Visitors
  providerId?: string;           // For Licensed Providers
  parentId?: string;             // For Parents
}

/**
 * Evaluates whether a given user context is authorized to view a specific GatedNote.
 */
export function canUserReadNote(
  note: GatedNote,
  user: NoteUserContext,
  targetChild?: Child,
  targetProvider?: Provider
): boolean {
  // 1. Admin has total access
  if (user.role === 'admin') {
    return true;
  }

  // 2. Parents: Strictly external notes on their own child only
  if (user.role === 'parent') {
    if (note.targetType !== 'child') return false;
    if (note.type !== 'external' || note.visibilityTier !== 'parents_and_staff') return false;
    // Must be their child
    if (targetChild && targetChild.parentId !== user.parentId && targetChild.parentId !== user.userId) {
      return false;
    }
    return true;
  }

  // 3. Licensed Providers
  if (user.role === 'provider') {
    // If note is on a child: must be assigned to this provider's home
    if (note.targetType === 'child') {
      if (targetChild && targetChild.providerId && user.providerId && targetChild.providerId !== user.providerId) {
        return false;
      }
      // Providers can see external notes and internal 'provider_team' notes
      return note.visibilityTier === 'parents_and_staff' || note.visibilityTier === 'provider_team';
    }

    // If note is on a provider: must be this provider's own record
    if (note.targetType === 'provider') {
      if (user.providerId && note.targetId !== user.providerId) return false;
      return note.visibilityTier === 'parents_and_staff' || note.visibilityTier === 'provider_team';
    }

    return false;
  }

  // 4. RECE Home Visitors
  if (user.role === 'visitor') {
    const assignedIds = user.assignedProviderIds || [];

    // Check if the target is within the visitor's caseload
    if (note.targetType === 'child') {
      if (targetChild?.providerId && assignedIds.length > 0 && !assignedIds.includes(targetChild.providerId)) {
        return false;
      }
    } else if (note.targetType === 'provider') {
      if (assignedIds.length > 0 && !assignedIds.includes(note.targetId)) {
        return false;
      }
    }

    // Visitors can see external, provider_team, and visitor_and_admin (NOT admin_only)
    return (
      note.visibilityTier === 'parents_and_staff' ||
      note.visibilityTier === 'provider_team' ||
      note.visibilityTier === 'visitor_and_admin'
    );
  }

  return false;
}

/**
 * Returns the list of visibility tiers a user role is permitted to set when authoring a note.
 */
export function getAllowedVisibilityTiersForRole(
  role: UserRole,
  targetType: NoteTargetType
): { tier: NoteVisibilityTier; label: string; description: string; type: NoteType }[] {
  if (role === 'parent') {
    return [
      {
        tier: 'parents_and_staff',
        label: 'External (Share with Caregiver & Agency)',
        description: 'Visible to your child care provider, home visitor, and agency director.',
        type: 'external'
      }
    ];
  }

  if (role === 'provider') {
    return [
      {
        tier: 'parents_and_staff',
        label: 'External (Share with Family)',
        description: 'Parent will see this note in their Family Portal.',
        type: 'external'
      },
      {
        tier: 'provider_team',
        label: 'Internal (Staff Only: Provider, Visitor & Director)',
        description: 'Hidden from family. Visible to you, your Home Visitor, and the Agency Director.',
        type: 'internal'
      }
    ];
  }

  if (role === 'visitor') {
    return [
      {
        tier: 'parents_and_staff',
        label: 'External (Share with Family & Staff)',
        description: 'Parent and provider can view this note.',
        type: 'external'
      },
      {
        tier: 'provider_team',
        label: 'Internal (Share with Provider & Director)',
        description: 'Hidden from family. Visible to the licensed provider and the Agency Director.',
        type: 'internal'
      },
      {
        tier: 'visitor_and_admin',
        label: 'Confidential (Home Visitor & Director Only)',
        description: 'Hidden from parent and provider. Private to field inspection staff and Director.',
        type: 'internal'
      }
    ];
  }

  // Admin / Director: Full control
  return [
    {
      tier: 'parents_and_staff',
      label: 'External (Share with Family & Staff)',
      description: 'Parent, provider, and visitor will see this note.',
      type: 'external'
    },
    {
      tier: 'provider_team',
      label: 'Internal (Provider Team: Provider + Visitor + Admin)',
      description: 'Hidden from family. Visible to all staff supporting this child/home.',
      type: 'internal'
    },
    {
      tier: 'visitor_and_admin',
      label: 'Confidential (Home Visitor & Director Only)',
      description: 'Hidden from family and provider. Private to field staff & executive office.',
      type: 'internal'
    },
    {
      tier: 'admin_only',
      label: 'Restricted (Director / Admin Only)',
      description: '100% private to Executive Director. Hidden from all field staff and parents.',
      type: 'internal'
    }
  ];
}
