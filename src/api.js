// Smart API:
// - Di lokal (localhost): Bisa terhubung ke json-server jika aktif, atau fallback ke localStorage.
// - Di Vercel / Cloud: 100% menggunakan localStorage secara mandiri tanpa memicu error 405.

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

// Cek apakah berjalan di localhost
function isLocalhost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
}

// LocalStorage helpers
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

let backendChecked = false;
let backendAvailable = false;

async function checkBackend() {
  // Jika di Vercel (bukan localhost), langsung gunakan localStorage
  if (!isLocalhost()) return false;
  if (backendChecked) return backendAvailable;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const res = await fetch('/api/monthlyDates', { signal: controller.signal });
    clearTimeout(timeout);
    
    const contentType = res.headers.get('content-type');
    // Harus respon 200 dan benar-benar JSON (bukan HTML dari Vercel/Vite fallback)
    if (res.ok && contentType && contentType.includes('application/json')) {
      backendAvailable = true;
    } else {
      backendAvailable = false;
    }
  } catch {
    backendAvailable = false;
  }
  backendChecked = true;
  return backendAvailable;
}

export const api = {
  // Monthly Dates
  async getMonthlyDates() {
    if (await checkBackend()) {
      try {
        const res = await fetch('/api/monthlyDates');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await res.json();
          }
        }
      } catch (err) {
        console.warn('Backend fetch error, fallback to localStorage', err);
      }
    }
    return getLocal('monthlyDates');
  },

  async addMonthlyDate(data) {
    if (await checkBackend()) {
      try {
        const res = await fetch('/api/monthlyDates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend add error, fallback to localStorage', err);
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
        const res = await fetch(`/api/monthlyDates/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend update error, fallback to localStorage', err);
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
        const res = await fetch(`/api/monthlyDates/${id}`, { method: 'DELETE' });
        if (res.ok) return;
      } catch (err) {
        console.warn('Backend delete error, fallback to localStorage', err);
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
        const res = await fetch('/api/longTermDates');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await res.json();
          }
        }
      } catch (err) {
        console.warn('Backend fetch error, fallback to localStorage', err);
      }
    }
    return getLocal('longTermDates');
  },

  async addLongTermDate(data) {
    if (await checkBackend()) {
      try {
        const res = await fetch('/api/longTermDates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend add error, fallback to localStorage', err);
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
        const res = await fetch(`/api/longTermDates/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend update error, fallback to localStorage', err);
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
        const res = await fetch(`/api/longTermDates/${id}`, { method: 'DELETE' });
        if (res.ok) return;
      } catch (err) {
        console.warn('Backend delete error, fallback to localStorage', err);
      }
    }
    const current = getLocal('longTermDates');
    const updated = current.filter((item) => item.id !== id);
    setLocal('longTermDates', updated);
  },
};
