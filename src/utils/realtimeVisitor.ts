import { VisitorEvent } from '../types';

/**
 * Real-time visitor detection and session tracking utilities.
 * No fake simulation: detects actual device, browser, referrer source, and approximate location.
 */

export function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('Chrome/')) return 'Google Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Apple Safari';
  if (ua.includes('Firefox/')) return 'Mozilla Firefox';
  if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
  return 'Web Browser';
}

export function detectDevice(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined') return 'Desktop';
  const width = window.innerWidth;
  if (width < 768) return 'Mobile';
  if (width < 1024) return 'Tablet';
  return 'Desktop';
}

export function detectReferrerSource(): {
  source: VisitorEvent['source'];
  isRecruiterSuspect: boolean;
} {
  if (typeof document === 'undefined') {
    return { source: 'Direct Access', isRecruiterSuspect: false };
  }

  const referrer = document.referrer.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const utmSource = (searchParams.get('utm_source') || searchParams.get('ref') || '').toLowerCase();

  if (referrer.includes('linkedin') || utmSource.includes('linkedin')) {
    return { source: 'LinkedIn', isRecruiterSuspect: true };
  }
  if (
    referrer.includes('job') ||
    referrer.includes('glints') ||
    referrer.includes('kalibrr') ||
    referrer.includes('indeed') ||
    utmSource.includes('recruiter')
  ) {
    return { source: 'Job Board', isRecruiterSuspect: true };
  }
  if (referrer.includes('wa.me') || referrer.includes('whatsapp') || utmSource.includes('whatsapp')) {
    return { source: 'WhatsApp Recruiter', isRecruiterSuspect: true };
  }
  if (referrer.includes('github') || utmSource.includes('github')) {
    return { source: 'GitHub', isRecruiterSuspect: false };
  }
  if (referrer.includes('google') || utmSource.includes('google')) {
    return { source: 'Google Search', isRecruiterSuspect: false };
  }

  return { source: 'Direct Access', isRecruiterSuspect: false };
}

export function detectLocationFromTimezone(): { city: string; country: string; countryCode: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Jakarta')) return { city: 'Jakarta', country: 'Indonesia', countryCode: 'ID' };
    if (tz.includes('Pontianak')) return { city: 'Pontianak', country: 'Indonesia', countryCode: 'ID' };
    if (tz.includes('Makassar')) return { city: 'Makassar', country: 'Indonesia', countryCode: 'ID' };
    if (tz.includes('Jayapura')) return { city: 'Jayapura', country: 'Indonesia', countryCode: 'ID' };
    if (tz.includes('Singapore')) return { city: 'Singapore', country: 'Singapore', countryCode: 'SG' };
    if (tz.includes('Kuala_Lumpur')) return { city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY' };
    if (tz.includes('Tokyo')) return { city: 'Tokyo', country: 'Jepang', countryCode: 'JP' };
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return { city: 'Sydney', country: 'Australia', countryCode: 'AU' };
    if (tz.includes('London')) return { city: 'London', country: 'United Kingdom', countryCode: 'GB' };
    if (tz.includes('New_York')) return { city: 'New York', country: 'United States', countryCode: 'US' };

    // Fallback extract city name from timezone string
    const parts = tz.split('/');
    if (parts.length > 1) {
      const city = parts[1].replace(/_/g, ' ');
      return { city, country: parts[0].replace(/_/g, ' '), countryCode: 'ID' };
    }
  } catch {
    // ignore
  }
  return { city: 'Jakarta', country: 'Indonesia', countryCode: 'ID' };
}

/**
 * Fetches accurate geo location asynchronously with strict timeout fallback
 */
export async function getRealVisitorLocation(): Promise<{ city: string; country: string; countryCode: string }> {
  const fallback = detectLocationFromTimezone();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch('https://freeipapi.com/api/json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.cityName && data.countryName) {
        return {
          city: data.cityName,
          country: data.countryName,
          countryCode: data.countryCode || 'ID',
        };
      }
    }
  } catch {
    // Network blocked, offline, or timeout: fallback to timezone
  }
  return fallback;
}

export function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

/**
 * Real active online sessions tracking across tabs/windows
 */
const SESSIONS_STORAGE_KEY = 'dimas_active_sessions';
const SESSION_ID = 'sess_' + Math.random().toString(36).substring(2, 9);

export function registerSessionHeartbeat(): () => void {
  const updateHeartbeat = () => {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const sessions: Record<string, number> = raw ? JSON.parse(raw) : {};
      const now = Date.now();

      // Clean up sessions inactive for > 35 seconds
      const active: Record<string, number> = {};
      for (const [id, lastSeen] of Object.entries(sessions)) {
        if (now - lastSeen < 35000) {
          active[id] = lastSeen;
        }
      }

      // Record current session
      active[SESSION_ID] = now;
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(active));
    } catch {
      // Storage unavailable or disabled
    }
  };

  updateHeartbeat();
  const interval = setInterval(updateHeartbeat, 15000);

  const cleanup = () => {
    clearInterval(interval);
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const sessions: Record<string, number> = JSON.parse(raw);
        delete sessions[SESSION_ID];
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      }
    } catch {}
  };

  window.addEventListener('beforeunload', cleanup);
  return () => {
    cleanup();
    window.removeEventListener('beforeunload', cleanup);
  };
}

export function countRealActiveSessions(): number {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return 1;
    const sessions: Record<string, number> = JSON.parse(raw);
    const now = Date.now();
    let count = 0;
    for (const lastSeen of Object.values(sessions)) {
      if (now - lastSeen < 35000) {
        count++;
      }
    }
    return Math.max(1, count);
  } catch {
    return 1;
  }
}
