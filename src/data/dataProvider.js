// Data provider: fetches from admin backend, falls back to hardcoded data if API unavailable

let cachedData = null;
let loadPromise = null;

export async function loadAllData() {
  if (cachedData) return cachedData;
  if (loadPromise) return loadPromise;

  loadPromise = fetch('/api/data/all')
    .then(res => {
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      return res.json();
    })
    .then(data => {
      cachedData = data;
      loadPromise = null;
      return data;
    })
    .catch(err => {
      console.warn('Data API unavailable, using fallback data:', err.message);
      loadPromise = null;
      return null;
    });

  return loadPromise;
}

export function getCachedData() {
  return cachedData;
}

export function clearCache() {
  cachedData = null;
  loadPromise = null;
}
