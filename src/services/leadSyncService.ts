/**
 * DaycareOS Master CRM Lead Synchronization Engine
 * ----------------------------------------------------------------------------
 * Dispatches verified portfolio demo leads to the central Protoss 2027 CRM
 * at https://protoss.ca/api/leads/subscribe for permanent cloud storage
 * and automated weekly digest reporting to jared@protoss.ca.
 */

export interface MasterLeadPayload {
  email: string;
  name?: string;
  organization?: string;
  source?: string;
  verified?: boolean;
  provider?: 'google' | 'email' | 'guest';
  subscribed?: boolean;
}

const PRIMARY_SYNC_URL = 'https://protoss.ca/api/leads/subscribe';
const QUEUE_STORAGE_KEY = 'daycare_os_pending_sync_leads';

/**
 * Syncs a single lead to the central master CRM in Protoss 2027
 */
export async function syncLeadToMaster(payload: MasterLeadPayload): Promise<boolean> {
  const cleanEmail = payload.email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return false;
  }

  const enrichedPayload = {
    email: cleanEmail,
    name: (payload.name || cleanEmail.split('@')[0]).trim(),
    organization: (payload.organization || 'Independent').trim(),
    source: payload.source || 'daycare-os-demo',
    verified: payload.verified ?? true,
    provider: payload.provider || 'email',
    subscribed: payload.subscribed ?? true,
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch(PRIMARY_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrichedPayload)
    });

    if (res.ok) {
      console.log('[Lead Sync] Successfully synchronized lead to Protoss Master CRM:', cleanEmail);
      return true;
    } else {
      console.warn('[Lead Sync] Master CRM response status:', res.status);
      queueLeadForRetry(enrichedPayload);
      return false;
    }
  } catch (err: any) {
    console.warn('[Lead Sync] Network error, queuing for retry:', err.message);
    queueLeadForRetry(enrichedPayload);
    return false;
  }
}

/**
 * Caches failed dispatches in localStorage so they flush when network resumes
 */
function queueLeadForRetry(lead: any): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    const queue: any[] = raw ? JSON.parse(raw) : [];
    // Deduplicate
    const filtered = queue.filter(item => item.email !== lead.email);
    filtered.push(lead);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {}
}

/**
 * Flushes all pending queued leads upon page load or network reconnect
 */
export async function flushPendingLeads(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return;

    const queue: any[] = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    console.log(`[Lead Sync] Flushing ${queue.length} pending leads to Protoss Master CRM...`);
    const remaining: any[] = [];

    for (const lead of queue) {
      try {
        const res = await fetch(PRIMARY_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        });
        if (!res.ok) {
          remaining.push(lead);
        }
      } catch (e) {
        remaining.push(lead);
      }
    }

    if (remaining.length === 0) {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
      console.log('[Lead Sync] All pending leads synchronized successfully.');
    } else {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
    }
  } catch (e) {
    console.warn('[Lead Sync] Error flushing pending leads:', e);
  }
}
