import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiCalendar, FiLink, FiTarget } from 'react-icons/fi';
import { FaPiggyBank } from 'react-icons/fa';
import ImageUploadInput from './ImageUploadInput';

const emptyForm = {
  name: '',
  date: '',
  location: '',
  locationUrl: '',
  imageUrl: '',
  visited: false,
  savingsTarget: '',
  savedAmount: '',
};

export default function DateForm({ type, editItem, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editItem) {
      const cleanDate = editItem.date
        ? (editItem.date.includes('T') ? editItem.date.split('T')[0] : editItem.date)
        : '';
      setForm({
        ...editItem,
        date: cleanDate,
        imageUrl: editItem.imageUrl || '',
        savingsTarget: editItem.savingsTarget ?? '',
        savedAmount: editItem.savedAmount ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      imageUrl: form.imageUrl || '',
      savingsTarget: type === 'longterm' ? Number(form.savingsTarget) || 0 : undefined,
      savedAmount: type === 'longterm' ? Number(form.savedAmount) || 0 : undefined,
    };
    if (type === 'monthly') {
      delete data.savingsTarget;
      delete data.savedAmount;
    }
    onSave(data);
  };

  const isEdit = !!editItem;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 animate-slide-up">
        {/* Form Header with gradient accent */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold">
                {isEdit ? 'Edit Destinasi' : 'Tambah Destinasi'}
              </h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {type === 'monthly' ? '🗓️ List Bulanan Kita' : '🎯 List Jangka Panjang'}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              <FiTarget className="w-3.5 h-3.5 text-blue-500" />
              Nama Tempat / Aktivitas
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Contoh: Dinner di Sky Dining ABC"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 placeholder:text-gray-300 text-sm font-medium"
            />
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              <FiCalendar className="w-3.5 h-3.5 text-blue-500" />
              Tanggal Target
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 text-sm font-medium"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-red-400" />
              Lokasi
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Contoh: Senayan, Jakarta Selatan"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 placeholder:text-gray-300 text-sm font-medium"
            />
          </div>

          {/* Location URL */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              <FiLink className="w-3.5 h-3.5 text-blue-500" />
              Link Google Maps
              <span className="text-gray-400 font-normal normal-case">(opsional)</span>
            </label>
            <input
              type="url"
              name="locationUrl"
              value={form.locationUrl}
              onChange={handleChange}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 placeholder:text-gray-300 text-sm font-medium"
            />
          </div>

          {/* Foto Tempat / Kenangan Date */}
          <ImageUploadInput
            value={form.imageUrl}
            onChange={handleImageChange}
            onUploadStatusChange={setUploading}
            label="Foto Tempat / Kenangan Date"
            placeholder="Pilih foto tempat atau kenangan kita"
          />

          {/* Savings fields (long term only) */}
          {type === 'longterm' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  <FaPiggyBank className="w-3.5 h-3.5 text-blue-500" />
                  Target Tabungan
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                  <input
                    type="number"
                    name="savingsTarget"
                    value={form.savingsTarget}
                    onChange={handleChange}
                    min="0"
                    placeholder="5.000.000"
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 placeholder:text-gray-300 text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  <FaPiggyBank className="w-3.5 h-3.5 text-green-500" />
                  Terkumpul
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                  <input
                    type="number"
                    name="savedAmount"
                    value={form.savedAmount}
                    onChange={handleChange}
                    min="0"
                    placeholder="2.000.000"
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 placeholder:text-gray-300 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`flex-1 px-5 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                uploading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 cursor-pointer'
              }`}
            >
              {uploading ? 'Sedang Mengunggah Foto...' : isEdit ? 'Simpan Perubahan' : 'Tambah Destinasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
