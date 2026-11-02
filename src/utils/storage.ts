import { Trip } from '../types';
import { INITIAL_MOCK_TRIP } from '../mockData';

const PRIMARY_KEY = 'tripsplit_trip_data_v2';
const BACKUP_KEYS = ['tripsplit_current_trip_v2', 'tripsplit_current_trip_v1'];

/**
 * Encodes trip to a safe base64 URL for sharing with friends
 */
export function encodeTripToUrl(trip: Trip): string {
  try {
    const jsonStr = JSON.stringify(trip);
    // Safe unicode to base64
    const base64 = btoa(encodeURIComponent(jsonStr));
    const url = new URL(window.location.origin + window.location.pathname + window.location.search);
    url.hash = `trip=${encodeURIComponent(base64)}`;
    return url.toString();
  } catch (e) {
    console.error('Failed to encode trip to URL', e);
    return window.location.href;
  }
}

/**
 * Decodes trip from URL hash if a friend opened a shared link
 * AND immediately removes the hash from the URL bar so future refreshes do not overwrite new edits!
 */
export function decodeTripFromUrl(): { trip: Trip; wasShared: boolean } | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!window.location.hash || !window.location.hash.includes('trip=')) {
      return null;
    }

    const hash = window.location.hash.substring(1);
    const prefix = 'trip=';
    const index = hash.indexOf(prefix);
    if (index === -1) return null;

    let rawParam = hash.substring(index + prefix.length).split('&')[0];
    let base64 = decodeURIComponent(rawParam).replace(/ /g, '+');

    const jsonStr = decodeURIComponent(atob(base64));
    const parsed = JSON.parse(jsonStr);

    if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
      // Clear hash from address bar immediately after reading
      // This is CRITICAL so that subsequent page refreshes do NOT revert to this snapshot!
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      return { trip: parsed, wasShared: true };
    }
  } catch (e) {
    console.error('Failed to decode trip from URL hash', e);
  }
  return null;
}

export function loadTrip(): Trip {
  // 1. Check if user opened a shared link via URL hash
  const sharedResult = decodeTripFromUrl();
  if (sharedResult && sharedResult.trip) {
    saveTrip(sharedResult.trip);
    return sharedResult.trip;
  }

  // 2. Try primary localStorage key
  try {
    const raw = localStorage.getItem(PRIMARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
        return parsed;
      }
    }

    // Try fallback legacy keys
    for (const key of BACKUP_KEYS) {
      const backupRaw = localStorage.getItem(key);
      if (backupRaw) {
        const parsed = JSON.parse(backupRaw);
        if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
          saveTrip(parsed);
          return parsed;
        }
      }
    }

    // Try sessionStorage as an extra fallback
    const sessionRaw = sessionStorage.getItem(PRIMARY_KEY);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
        saveTrip(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load trip from storage', e);
  }

  // 3. Fallback to mock data on fresh start
  return INITIAL_MOCK_TRIP;
}

export function saveTrip(trip: Trip): void {
  try {
    const updated = {
      ...trip,
      updatedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(updated);

    // Save to primary localStorage
    localStorage.setItem(PRIMARY_KEY, jsonStr);

    // Also mirror to sessionStorage as secondary fallback
    try {
      sessionStorage.setItem(PRIMARY_KEY, jsonStr);
    } catch {
      // Ignore sessionStorage errors
    }
  } catch (e) {
    console.error('Failed to save trip to localStorage', e);
  }
}

export function resetToMockTrip(): Trip {
  try {
    const jsonStr = JSON.stringify(INITIAL_MOCK_TRIP);
    localStorage.setItem(PRIMARY_KEY, jsonStr);
    for (const key of BACKUP_KEYS) {
      try { localStorage.removeItem(key); } catch {}
    }
    try { sessionStorage.setItem(PRIMARY_KEY, jsonStr); } catch {}

    // Clear hash if any
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  } catch (e) {
    console.error('Failed to reset trip', e);
  }
  return INITIAL_MOCK_TRIP;
}

export function exportTripToJson(trip: Trip): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trip, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `tripsplit-${trip.id || 'export'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importTripFromJson(file: File, onSuccess: (trip: Trip) => void, onError: (err: string) => void): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
        saveTrip(parsed);
        onSuccess(parsed);
      } else {
        onError('โครงสร้างไฟล์ JSON ไม่ถูกต้องสำหรับ TripSplit');
      }
    } catch {
      onError('ไม่สามารถอ่านไฟล์ JSON ได้');
    }
  };
  reader.readAsText(file);
}
