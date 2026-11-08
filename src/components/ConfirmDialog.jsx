import { FiAlertTriangle, FiTrash2, FiX, FiCalendar, FiMapPin } from 'react-icons/fi';

export default function ConfirmDialog({ item, onConfirm, onCancel }) {
  if (!item) return null;

  const displayName = item.name || item.cityName || 'Item ini';
  const displayDate = item.startDate
    ? `${item.startDate} – ${item.endDate || item.startDate}`
    : item.date;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 text-center animate-slide-up relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50/50">
          <FiAlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-1">Konfirmasi Hapus</h3>
        <p className="text-xs text-slate-500 mb-4">
          Data berikut akan dihapus secara permanen dari daftar rencana kita:
        </p>

        {/* Card ringkasan yang akan dihapus */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-left mb-6">
          <p className="font-bold text-slate-800 text-sm truncate mb-1.5">{displayName}</p>
          <div className="space-y-1 text-xs text-slate-500">
            {displayDate && (
              <div className="flex items-center gap-2">
                <FiCalendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>{displayDate}</span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-2">
                <FiMapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            <FiTrash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
