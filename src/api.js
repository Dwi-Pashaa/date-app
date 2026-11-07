// Smart API: Menggunakan json-server di lokal jika aktif,
// atau otomatis fallback ke localStorage jika di-deploy ke Vercel (serverless).

const API_BASE = '/api';

const initialData = {
  monthlyDates: [
    {
      id: 1,
      name: "Dinner Romantis di Resto ABC",
      date: "2026-12-15",
      location: "Resto ABC, Jakarta Selatan",
      locationUrl: "https://maps.google.com/?q=Jakarta+Selatan",
      visited: false
    },
    {
      id: 2,
      name: "Piknik di Taman Mini",
      date: "2026-12-20",
      location: "Taman Mini Indonesia Indah",
      locationUrl: "https://maps.google.com/?q=Taman+Mini+Indonesia+Indah",
      visited: true
    }
  ],
  longTermDates: [
    {
      id: 1,
      name: "Trip ke Bali",
      date: "2027-06-01",
      location: "Bali, Indonesia",
      locationUrl: "https://maps.google.com/?q=Bali+Indonesia",
      visited: false,
      savingsTarget: 5000000,
      savedAmount: 2000000
    },
    {
      id: 2,
      name: "Liburan ke Jepang",
      date: "2027-12-01",
      location: "Tokyo, Jepang",
      locationUrl: "https://maps.google.com/?q=Tokyo+Japan",
      visited: false,
      savingsTarget: 25000000,
      savedAmount: 5000000
    }
  ]
};

// Helper localStorage
function getLocal(key) {
  try {
    const data = localStorage.getItem(`list_date_${key}`);
    if (data) return JSON.parse(data);
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

let isBackendAvailable = null;

async function checkBackend() {
  if (isBackendAvailable !== null) return isBackendAvailable;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/monthlyDates`, { signal: controller.signal });
    clearTimeout(timeout);
    isBackendAvailable = res.ok;
  } catch {
    isBackendAvailable = false;
  }
  return isBackendAvailable;
}

export const api = {
  // Monthly Dates
  async getMonthlyDates() {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/monthlyDates`);
        return await res.json();
      } catch {
        // fallback
      }
    }
    return getLocal('monthlyDates');
  },

  async addMonthlyDate(data) {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/monthlyDates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await res.json();
      } catch {
        // fallback
      }
    }
    const current = getLocal('monthlyDates');
    const newItem = { ...data, id: Date.now() };
    const updated = [newItem, ...current];
    setLocal('monthlyDates', updated);
    return newItem;
  },

  async updateMonthlyDate(id, data) {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/monthlyDates/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await res.json();
      } catch {
        // fallback
      }
    }
    const current = getLocal('monthlyDates');
    const updated = current.map((item) => (item.id === id ? { ...data, id } : item));
    setLocal('monthlyDates', updated);
    return { ...data, id };
  },

  async deleteMonthlyDate(id) {
    if (await checkBackend()) {
      try {
        await fetch(`${API_BASE}/monthlyDates/${id}`, { method: 'DELETE' });
        return;
      } catch {
        // fallback
      }
    }
    const current = getLocal('monthlyDates');
    const updated = current.filter((item) => item.id !== id);
    setLocal('monthlyDates', updated);
  },

  // Long Term Dates
  async getLongTermDates() {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/longTermDates`);
        return await res.json();
      } catch {
        // fallback
      }
    }
    return getLocal('longTermDates');
  },

  async addLongTermDate(data) {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/longTermDates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await res.json();
      } catch {
        // fallback
      }
    }
    const current = getLocal('longTermDates');
    const newItem = { ...data, id: Date.now() };
    const updated = [newItem, ...current];
    setLocal('longTermDates', updated);
    return newItem;
  },

  async updateLongTermDate(id, data) {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/longTermDates/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await res.json();
      } catch {
        // fallback
      }
    }
    const current = getLocal('longTermDates');
    const updated = current.map((item) => (item.id === id ? { ...data, id } : item));
    setLocal('longTermDates', updated);
    return { ...data, id };
  },

  async deleteLongTermDate(id) {
    if (await checkBackend()) {
      try {
        await fetch(`${API_BASE}/longTermDates/${id}`, { method: 'DELETE' });
        return;
      } catch {
        // fallback
      }
    }
    const current = getLocal('longTermDates');
    const updated = current.filter((item) => item.id !== id);
    setLocal('longTermDates', updated);
  },
};
