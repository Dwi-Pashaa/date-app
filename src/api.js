// Smart Data API
// Data disimpan di In-Memory State (dan langsung sinkron ke Google Spreadsheet jika terhubung).
// Sesuai permintaan: TIDAK menyimpan data list ke localStorage browser.

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

// In-Memory Store (Murni di memori RAM aplikasi, TANPA localStorage)
let memoryStore = {
  monthlyDates: JSON.parse(JSON.stringify(initialData.monthlyDates)),
  longTermDates: JSON.parse(JSON.stringify(initialData.longTermDates)),
};

// Bersihkan data list lama dari localStorage jika sebelumnya sempat tersimpan
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('list_date_monthlyDates');
    localStorage.removeItem('list_date_longTermDates');
  } catch {}
}

// URL Google Sheets dari memory/session
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

// Google Sheets Fetcher
async function fetchGoogleSheets() {
  const url = getSheetsUrl();
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.status === 'success') {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Gagal membaca Google Sheets:', err);
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
      memoryStore.monthlyDates = sheetsData.monthlyDates;
      return memoryStore.monthlyDates;
    }
    return memoryStore.monthlyDates;
  },

  async addMonthlyDate(data) {
    const newItem = {
      ...data,
      id: 'm_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    // Simpan ke in-memory store (terbaru di depan)
    memoryStore.monthlyDates = [newItem, ...memoryStore.monthlyDates];

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('add', 'monthlyDates', newItem);
    }

    return newItem;
  },

  async updateMonthlyDate(id, data) {
    memoryStore.monthlyDates = memoryStore.monthlyDates.map((item) =>
      String(item.id) === String(id) ? { ...item, ...data, id } : item
    );

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('update', 'monthlyDates', { ...data, id });
    }

    return { ...data, id };
  },

  async deleteMonthlyDate(id) {
    memoryStore.monthlyDates = memoryStore.monthlyDates.filter(
      (item) => String(item.id) !== String(id)
    );

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('delete', 'monthlyDates', id);
    }
  },

  // Long Term Dates
  async getLongTermDates() {
    const sheetsData = await fetchGoogleSheets();
    if (sheetsData && Array.isArray(sheetsData.longTermDates)) {
      memoryStore.longTermDates = sheetsData.longTermDates;
      return memoryStore.longTermDates;
    }
    return memoryStore.longTermDates;
  },

  async addLongTermDate(data) {
    const newItem = {
      ...data,
      id: 'lt_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    memoryStore.longTermDates = [newItem, ...memoryStore.longTermDates];

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('add', 'longTermDates', newItem);
    }

    return newItem;
  },

  async updateLongTermDate(id, data) {
    memoryStore.longTermDates = memoryStore.longTermDates.map((item) =>
      String(item.id) === String(id) ? { ...item, ...data, id } : item
    );

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('update', 'longTermDates', { ...data, id });
    }

    return { ...data, id };
  },

  async deleteLongTermDate(id) {
    memoryStore.longTermDates = memoryStore.longTermDates.filter(
      (item) => String(item.id) !== String(id)
    );

    if (getSheetsUrl()) {
      sendGoogleSheetsAction('delete', 'longTermDates', id);
    }
  },
};
