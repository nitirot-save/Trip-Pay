import { Trip } from '../types';
import { INITIAL_MOCK_TRIP } from '../mockData';

const STORAGE_KEY = 'tripsplit_current_trip_v2';

/**
 * Encodes trip to a safe base64 URL hash
 */
export function encodeTripToUrl(trip: Trip): string {
  try {
    const jsonStr = JSON.stringify(trip);
    // encode UTF-8 to base64
    const base64 = btoa(encodeURIComponent(jsonStr));
    const url = new URL(window.location.href);
    url.hash = `trip=${base64}`;
    return url.toString();
  } catch (e) {
    console.error('Failed to encode trip to URL', e);
    return window.location.href;
  }
}

/**
 * Decodes trip from URL hash if present
 */
export function decodeTripFromUrl(): Trip | null {
  try {
    if (!window.location.hash || !window.location.hash.includes('trip=')) {
      return null;
    }
    const hash = window.location.hash.substring(1); // remove '#'
    const params = new URLSearchParams(hash);
    const tripParam = params.get('trip');
    if (!tripParam) return null;

    const jsonStr = decodeURIComponent(atob(tripParam));
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to decode trip from URL', e);
  }
  return null;
}

export function loadTrip(): Trip {
  // 1. Try URL hash first (if user received a shared link from a friend)
  const fromUrl = decodeTripFromUrl();
  if (fromUrl) {
    saveTrip(fromUrl);
    return fromUrl;
  }

  // 2. Try localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('tripsplit_current_trip_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load trip from localStorage', e);
  }

  // 3. Fallback to mock data
  return INITIAL_MOCK_TRIP;
}

export function saveTrip(trip: Trip): void {
  try {
    const updated = { ...trip, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save trip to localStorage', e);
  }
}

export function resetToMockTrip(): Trip {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TRIP));
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
