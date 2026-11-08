import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiClock, FiCalendar, FiLink, FiTarget } from 'react-icons/fi';
import ImageUploadInput from './ImageUploadInput';

const emptyDestForm = {
  placeName: '',
  time: '',
  date: '',
  location: '',
  locationUrl: '',
  imageUrl: '',
};

export default function DestinationFormModal({ isOpen, city, editDest, onSave, onClose }) {
  const [form, setForm] = useState(emptyDestForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editDest) {
      setForm({
        placeName: editDest.placeName || '',
        time: editDest.time || '',
        date: editDest.date || city?.startDate || '',
        location: editDest.location || '',
        locationUrl: editDest.locationUrl || '',
        imageUrl: editDest.imageUrl || '',
      });
    } else {
      setForm({
        ...emptyDestForm,
        date: city?.startDate || '',
      });
    }
  }, [editDest, city, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.placeName.trim() || !form.time || !form.location.trim()) return;

    onSave({
      ...form,
      imageUrl: form.imageUrl || '',
      id: editDest ? editDest.id : 'dest_' + Date.now(),
      visited: editDest ? editDest.visited : false,
    });
  };

  const isEdit = Boolean(editDest);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100 animate-slide-up">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg">
                {isEdit ? 'Edit Destinasi' : 'Tambah Destinasi Baru'}
              </h3>
              <p className="text-blue-100 text-xs mt-0.5 truncate max-w-[240px]">
                Di kota: {city?.cityName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nama Tempat */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <FiTarget className="w-3.5 h-3.5 text-blue-600" />
              Nama Tempat / Aktivitas
            </label>
            <input
              type="text"
              name="placeName"
              value={form.placeName}
              onChange={handleChange}
              required
              placeholder="Contoh: Kawah Putih, Cafe Dago Atas"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-xs sm:text-sm font-semibold placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          {/* Jam & Tanggal Kunjungan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                <FiClock className="w-3.5 h-3.5 text-blue-600" />
                Jam Kunjungan
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-xs sm:text-sm font-semibold"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-indigo-600" />
                Tanggal
              </label>
              <input
                type="date"
                name="date"
                min={city?.startDate}
                max={city?.endDate}
                value={form.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-rose-500" />
              Lokasi Tempat
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Contoh: Jl. Dago No. 12, Bandung"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-xs sm:text-sm font-semibold placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          {/* Foto Tempat / Destinasi */}
          <ImageUploadInput
            value={form.imageUrl}
            onChange={handleImageChange}
            onUploadStatusChange={setUploading}
            label="Foto Tempat Wisata / Cafe"
            placeholder="Pilih foto tempat ini"
          />

          {/* Link Google Maps */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <FiLink className="w-3.5 h-3.5 text-blue-500" />
              Link Google Maps <span className="text-slate-400 font-normal normal-case">(opsional)</span>
            </label>
            <input
              type="url"
              name="locationUrl"
              value={form.locationUrl}
              onChange={handleChange}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 text-xs sm:text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`flex-1 py-2.5 px-4 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                uploading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20'
              }`}
            >
              {uploading ? 'Sedang Mengunggah...' : isEdit ? 'Simpan' : 'Tambah Tempat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
