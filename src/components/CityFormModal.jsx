import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiCalendar, FiFileText, FiCompass } from 'react-icons/fi';
import ImageUploadInput from './ImageUploadInput';

const emptyForm = {
  cityName: '',
  startDate: '',
  endDate: '',
  notes: '',
  coverUrl: '',
};

export default function CityFormModal({ isOpen, editCity, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editCity) {
      setForm({
        cityName: editCity.cityName || '',
        startDate: editCity.startDate || '',
        endDate: editCity.endDate || '',
        notes: editCity.notes || '',
        coverUrl: editCity.coverUrl || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editCity, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverChange = (url) => {
    setForm((prev) => ({ ...prev, coverUrl: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cityName.trim() || !form.startDate) return;

    onSave({
      ...form,
      endDate: form.endDate || form.startDate,
      coverUrl: form.coverUrl || '',
      destinations: editCity ? editCity.destinations : [],
    });
  };

  const isEdit = Boolean(editCity);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 animate-slide-up">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 p-6 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                {isEdit ? 'Edit Kota Tujuan Kita' : 'Tambah Kota Tujuan Kita'}
              </h3>
              <p className="text-blue-100 text-xs mt-0.5">
                Rencanakan jadwal perjalanan dan tempat yang ingin kita kunjungi
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nama Kota */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <FiCompass className="w-3.5 h-3.5 text-blue-600" />
              Nama Kota / Judul Trip
            </label>
            <input
              type="text"
              name="cityName"
              value={form.cityName}
              onChange={handleChange}
              required
              placeholder="Contoh: Bandung Romantis, Trip Jogja, dsb."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-sm font-semibold placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          {/* Tanggal Mulai & Tanggal Selesai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-blue-600" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-xs sm:text-sm font-semibold"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-indigo-600" />
                Tanggal Selesai
              </label>
              <input
                type="date"
                name="endDate"
                min={form.startDate}
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          {/* Foto Cover Kota */}
          <ImageUploadInput
            value={form.coverUrl}
            onChange={handleCoverChange}
            onUploadStatusChange={setUploading}
            label="Foto Cover Kota / Trip"
            placeholder="Pilih foto pemandangan / landmark kota"
          />

          {/* Catatan / Notes */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <FiFileText className="w-3.5 h-3.5 text-slate-500" />
              Catatan Trip Kita <span className="text-slate-400 font-normal normal-case">(opsional)</span>
            </label>
            <textarea
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
              placeholder="Contoh: Menginap di hotel dekat pusat kota, siapin baju hangat, dsb."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-xs sm:text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                uploading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {uploading ? 'Sedang Mengunggah Foto...' : isEdit ? 'Simpan Perubahan' : 'Buat Trip Kota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
