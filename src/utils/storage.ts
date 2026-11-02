import { Trip } from '../types';
import { INITIAL_MOCK_TRIP } from '../mockData';

const STORAGE_KEY = 'tripsplit_current_trip_v1';

export function loadTrip(): Trip {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MOCK_TRIP;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load trip from localStorage', e);
  }
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
