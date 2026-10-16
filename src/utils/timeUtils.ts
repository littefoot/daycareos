/**
 * Time parsing, formatting, and duration calculation utilities for ACCS.
 * Supports:
 * - 12-hour: '8:15 AM', '4pm', '4 PM', '4:30pm', '4:00 PM'
 * - 24-hour: '16:00', '08:15', '16:30'
 * - Bare numbers: '4' (in afternoon child care context -> 4:00 PM / 16:00), '8' (-> 8:00 AM)
 * - ISO timestamps: '2026-10-02T16:00:00.000Z'
 */

export function parseFlexibleTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim();

  // 1. ISO or Date string (e.g. 2026-10-02T16:00:00)
  if (clean.includes('T')) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.getHours() * 60 + d.getMinutes();
    }
  }

  // 2. Colon-formatted: "4:00 PM", "04:30pm", "8:15 AM", "16:00", "8:15"
  const colonMatch = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|A|P)?$/i);
  if (colonMatch) {
    let hours = parseInt(colonMatch[1], 10);
    const minutes = parseInt(colonMatch[2], 10);
    const meridian = colonMatch[3]?.toUpperCase();

    if ((meridian === 'PM' || meridian === 'P') && hours < 12) hours += 12;
    if ((meridian === 'AM' || meridian === 'A') && hours === 12) hours = 0;

    // In child care, if hours are between 1 and 6 with no meridian, it is afternoon PM (13:00 - 18:00)
    if (!meridian && hours >= 1 && hours <= 6) {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  // 3. Hour with meridian (no colon): "4pm", "4 pm", "4p", "11am", "12pm"
  const hourMeridianMatch = clean.match(/^(\d{1,2})\s*(AM|PM|A|P)$/i);
  if (hourMeridianMatch) {
    let hours = parseInt(hourMeridianMatch[1], 10);
    const meridian = hourMeridianMatch[2].toUpperCase();
    if ((meridian === 'PM' || meridian === 'P') && hours < 12) hours += 12;
    if ((meridian === 'AM' || meridian === 'A') && hours === 12) hours = 0;
    return hours * 60;
  }

  // 4. Bare hour numbers: e.g. "4", "16", "8"
  const bareNumberMatch = clean.match(/^(\d{1,2})$/);
  if (bareNumberMatch) {
    let hours = parseInt(bareNumberMatch[1], 10);
    if (hours >= 1 && hours <= 6) hours += 12;
    return hours * 60;
  }

  return 0;
}

/**
 * Calculates net care hours rounded to 1 decimal place.
 */
export function calculateNetCareHours(inTime: string, outTime: string): number {
  const inMin = parseFlexibleTimeToMinutes(inTime);
  const outMin = parseFlexibleTimeToMinutes(outTime);
  if (outMin <= inMin) return 0;
  const diffHours = (outMin - inMin) / 60;
  return Math.round(diffHours * 10) / 10;
}

/**
 * Normalizes any user-typed time string into a canonical 12-hour display string (e.g. "4:00 PM").
 */
export function normalizeTimeString(timeStr: string): string {
  if (!timeStr) return '';
  const totalMin = parseFlexibleTimeToMinutes(timeStr);
  if (totalMin === 0 && !timeStr.match(/^12:00\s*AM/i)) {
    return timeStr.trim();
  }
  const hours24 = Math.floor(totalMin / 60) % 24;
  const minutes = totalMin % 60;
  const meridian = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const padMin = String(minutes).padStart(2, '0');
  return `${hours12}:${padMin} ${meridian}`;
}

/**
 * Converts a time string or minutes to "HH:mm" for native <input type="time">.
 */
export function formatToTimeInputValue(timeStr: string): string {
  if (!timeStr) return '';
  const totalMin = parseFlexibleTimeToMinutes(timeStr);
  const hours24 = Math.floor(totalMin / 60) % 24;
  const minutes = totalMin % 60;
  return `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Converts a time string into a full ISO timestamp string for a given date (defaults to today).
 */
export function formatToISOTimestamp(timeStr: string, dateStr?: string): string {
  const totalMin = parseFlexibleTimeToMinutes(timeStr);
  const base = dateStr ? new Date(dateStr) : new Date();
  const hours24 = Math.floor(totalMin / 60) % 24;
  const minutes = totalMin % 60;
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours24, minutes, 0);
  return d.toISOString();
}

/**
 * Formats a message timestamp into a friendly date/time string:
 * - If sent today: "Today, 10:25 AM"
 * - If sent yesterday: "Yesterday, 3:15 PM"
 * - If sent earlier this year: "Oct 3, 2:10 PM"
 * - If sent in a different year: "Oct 3, 2025, 2:10 PM"
 * - Graceful fallback for legacy time-only strings (e.g. "8:15 AM"): "Today, 8:15 AM"
 */
export function formatMessageTimestamp(rawTimestamp?: string | null): string {
  if (!rawTimestamp) return '';
  const clean = rawTimestamp.trim();
  if (!clean) return '';

  // Already prefixed with relative date
  if (clean.startsWith('Today') || clean.startsWith('Yesterday')) {
    return clean;
  }

  // Check if it's purely a 12h or 24h time without a date (e.g., "8:15 AM", "14:30")
  const bareTimeMatch = clean.match(/^(\d{1,2}:\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (bareTimeMatch && !clean.includes('-') && !clean.includes('/') && !clean.includes('T')) {
    return `Today, ${clean}`;
  }

  const date = new Date(clean);
  if (isNaN(date.getTime())) {
    // If unparseable as a date, fallback gracefully
    return clean.includes(':') ? `Today, ${clean}` : clean;
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) {
    return `Today, ${timeStr}`;
  }
  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  const isCurrentYear = date.getFullYear() === now.getFullYear();
  const dateStr = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' })
  });

  return `${dateStr}, ${timeStr}`;
}

