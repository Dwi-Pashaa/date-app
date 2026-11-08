// Smart Data API
// 1. Google Spreadsheet jika URL disetting (Cloud Data Permanen).
// 2. Local Storage browser (Otomatis & Realtime di Vercel maupun lokal).

const initialData = {
  monthlyDates: [
    {
      id: "m_1",
      name: "Dinner Romantis di Resto ABC",
      date: "2026-12-15",
      location: "Resto ABC, Jakarta Selatan",
      locationUrl: "https://maps.google.com/?q=Jakarta+Selatan",
      visited: false,
      createdAt: "2026-11-01T10:00:00.000Z"
    },
    {
      id: "m_2",
      name: "Piknik di Taman Mini",
      date: "2026-12-20",
      location: "Taman Mini Indonesia Indah",
      locationUrl: "https://maps.google.com/?q=Taman+Mini+Indonesia+Indah",
      visited: true,
      createdAt: "2026-11-02T10:00:00.000Z"
    }
  ],
  longTermDates: [
    {
      id: "lt_1",
      name: "Trip ke Bali",
      date: "2027-06-01",
      location: "Bali, Indonesia",
      locationUrl: "https://maps.google.com/?q=Bali+Indonesia",
      visited: false,
      savingsTarget: 5000000,
      savedAmount: 2000000,
      createdAt: "2026-11-01T10:00:00.000Z"
    },
    {
      id: "lt_2",
      name: "Liburan ke Jepang",
      date: "2027-12-01",
      location: "Tokyo, Jepang",
      locationUrl: "https://maps.google.com/?q=Tokyo+Japan",
      visited: false,
      savingsTarget: 25000000,
      savedAmount: 5000000,
      createdAt: "2026-11-02T10:00:00.000Z"
    }
  ]
};

// URL Google Sheets dari localStorage atau .env
export function getSheetsUrl() {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem('list_date_sheets_url');
  if (stored && stored.trim()) return stored.trim();
  const envUrl = import.meta.env.VITE_SHEETS_API_URL;
  return envUrl ? envUrl.trim() : '';
}

export function setSheetsUrl(url) {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('list_date_sheets_url');
  } else {
    localStorage.setItem('list_date_sheets_url', url.trim());
  }
}

// LocalStorage helpers
function getLocal(key) {
  try {
    const raw = localStorage.getItem(`list_date_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    localStorage.setItem(`list_date_${key}`, JSON.stringify(initialData[key]));
    return initialData[key];
  } catch {
    return initialData[key];
  }
}

function setLocal(key, data) {
  try {
    localStorage.setItem(`list_date_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error('Gagal menulis localStorage', err);
  }
}

// Google Sheets Fetcher
async function fetchGoogleSheets() {
  const url = getSheetsUrl();
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.status === 'success') {
      if (Array.isArray(data.monthlyDates)) setLocal('monthlyDates', data.monthlyDates);
      if (Array.isArray(data.longTermDates)) setLocal('longTermDates', data.longTermDates);
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Gagal membaca Google Sheets, memakai data lokal:', err);
    return null;
  }
}

// Mengirim aksi ke Google Sheets tanpa preflight CORS OPTIONS error
async function sendGoogleSheetsAction(action, type, payload) {
  const url = getSheetsUrl();
  if (!url) return false;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        type,
        ...(action === 'delete' ? { id: payload } : { data: payload }),
      }),
    });
    return true;
  } catch (err) {
    console.warn('Gagal sync ke Google Sheets:', err);
    return false;
  }
}

export const api = {
  getSheetsUrl,
  setSheetsUrl,

  async testConnection(urlToTest) {
    if (!urlToTest || !urlToTest.startsWith('http')) {
      throw new Error('URL tidak valid. Pastikan diawali https://script.google.com/...');
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(urlToTest, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Respon server error (${res.status})`);
      const data = await res.json();
      if (data.status !== 'success') {
        throw new Error(data.message || 'Respon Google Sheets tidak sesuai format.');
      }
      return data;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  },

  // Monthly Dates
  async getMonthlyDates() {
    const sheetsData = await fetchGoogleSheets();
    if (sheetsData && Array.isArray(sheetsData.monthlyDates)) {
      return sheetsData.monthlyDates;
    }
    return getLocal('monthlyDates');
  },

  async addMonthlyDate(data) {
    const current = getLocal('monthlyDates');
    const newItem = {
      ...data,
      id: 'm_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    // Letakkan yang terbaru di index paling depan
    const updated = [newItem, ...current];
    setLocal('monthlyDates', updated);

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('add', 'monthlyDates', newItem);
    }

    return newItem;
  },

  async updateMonthlyDate(id, data) {
    const current = getLocal('monthlyDates');
    const updated = current.map((item) =>
      String(item.id) === String(id) ? { ...item, ...data, id } : item
    );
    setLocal('monthlyDates', updated);

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('update', 'monthlyDates', { ...data, id });
    }

    return { ...data, id };
  },

  async deleteMonthlyDate(id) {
    const current = getLocal('monthlyDates');
    const updated = current.filter((item) => String(item.id) !== String(id));
    setLocal('monthlyDates', updated);

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('delete', 'monthlyDates', id);
    }
  },

  // Long Term Dates
  async getLongTermDates() {
    const sheetsData = await fetchGoogleSheets();
    if (sheetsData && Array.isArray(sheetsData.longTermDates)) {
      return sheetsData.longTermDates;
    }
    return getLocal('longTermDates');
  },

  async addLongTermDate(data) {
    const current = getLocal('longTermDates');
    const newItem = {
      ...data,
      id: 'lt_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    // Letakkan yang terbaru di index paling depan
    const updated = [newItem, ...current];
    setLocal('longTermDates', updated);

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('add', 'longTermDates', newItem);
    }

    return newItem;
  },

  async updateLongTermDate(id, data) {
    const current = getLocal('longTermDates');
    const updated = current.map((item) =>
      String(item.id) === String(id) ? { ...item, ...data, id } : item
    );
    setLocal('longTermDates', updated);

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('update', 'longTermDates', { ...data, id });
    }

    return { ...data, id };
  },

  async deleteLongTermDate(id) {
    const current = getLocal('longTermDates');
    const updated = current.filter((item) => String(item.id) !== String(id));
    setLocal('longTermDates', updated);

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('delete', 'longTermDates', id);
    }
  },
};
