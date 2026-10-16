import { AgencyLogoRecord } from '../types';
import { AGENCY_PHONE } from '../config/agencyConfig';

export interface AgencyEntityDetails {
  key: string;
  name: string;
  shortName: string;
  code: string;
  subtitle: string;
  director: string;
  email: string;
  phone: string;
  defaultLogoId: string;
  licenseNumber: string;
}

export const AGENCY_ENTITIES: Record<string, AgencyEntityDetails> = {
  daycare_os: {
    key: 'daycare_os',
    name: 'DaycareOS Child Care Network',
    shortName: 'DaycareOS',
    code: 'DCOS',
    subtitle: 'Licensed Child Care Operating System',
    director: 'Agency Director',
    email: 'billing@daycare-os.ca',
    phone: AGENCY_PHONE,
    defaultLogoId: 'logo-daycare-os',
    licenseNumber: 'HCCA-ON-2026-0812'
  },
  // Fallback aliases for backward compatibility
  accs: {
    key: 'daycare_os',
    name: 'DaycareOS Child Care Network',
    shortName: 'DaycareOS',
    code: 'DCOS',
    subtitle: 'Licensed Child Care Operating System',
    director: 'Agency Director',
    email: 'billing@daycare-os.ca',
    phone: AGENCY_PHONE,
    defaultLogoId: 'logo-daycare-os',
    licenseNumber: 'HCCA-ON-2026-0812'
  },
  circles_in_the_sun: {
    key: 'daycare_os',
    name: 'DaycareOS Child Care Network',
    shortName: 'DaycareOS',
    code: 'DCOS',
    subtitle: 'Licensed Child Care Operating System',
    director: 'Agency Director',
    email: 'billing@daycare-os.ca',
    phone: AGENCY_PHONE,
    defaultLogoId: 'logo-daycare-os',
    licenseNumber: 'HCCA-ON-2026-0812'
  }
};

export const DEFAULT_AGENCY_LOGOS: AgencyLogoRecord[] = [
  {
    id: 'logo-daycare-os',
    name: 'DaycareOS (Primary Agency Mark)',
    agencyEntity: 'custom',
    url: '/logos/all_child_care_solutions.png',
    localFallbackUrl: '/logos/all_child_care_solutions.png',
    isDefault: true,
    sourceType: 'local',
    printHeightPx: 56,
    uploadedAt: '2026-10-16'
  }
];

const STORAGE_KEY_LOGOS = 'daycare_os_agency_logos_library';
const STORAGE_KEY_ACTIVE_LOGO = 'daycare_os_active_print_logo_id';
const STORAGE_KEY_ACTIVE_ENTITY = 'daycare_os_active_print_entity';

export function loadLogosFromStorage(): AgencyLogoRecord[] {
  if (typeof window === 'undefined') return DEFAULT_AGENCY_LOGOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGOS);
    if (!raw) return DEFAULT_AGENCY_LOGOS;
    const custom: AgencyLogoRecord[] = JSON.parse(raw);
    const merged = [...DEFAULT_AGENCY_LOGOS];
    custom.forEach(c => {
      const idx = merged.findIndex(m => m.id === c.id);
      if (idx >= 0) {
        merged[idx] = c;
      } else {
        merged.push(c);
      }
    });
    return merged;
  } catch (e) {
    console.error('Failed to parse custom logos from storage:', e);
    return DEFAULT_AGENCY_LOGOS;
  }
}

export function saveLogosToStorage(logos: AgencyLogoRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LOGOS, JSON.stringify(logos));
  } catch (e) {
    console.error('Failed to persist custom logos:', e);
  }
}

export function loadActivePrintEntity(): string {
  return 'daycare_os';
}

export function saveActivePrintEntity(entity: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ENTITY, entity);
  } catch (e) {}
}

export function loadActivePrintLogoId(): string {
  if (typeof window === 'undefined') return 'logo-daycare-os';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_LOGO);
    if (saved) return saved;
  } catch (e) {}
  return 'logo-daycare-os';
}

export function saveActivePrintLogoId(logoId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_LOGO, logoId);
  } catch (e) {}
}
