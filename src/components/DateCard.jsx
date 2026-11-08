import {
  FiMapPin,
  FiCalendar,
  FiExternalLink,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiPlus,
  FiAward,
} from 'react-icons/fi';
import { FaPiggyBank } from 'react-icons/fa';

function formatCurrency(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

function safeParseDate(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  let s = String(val).trim();
  if (!s || s === 'null' || s === 'undefined') return null;
  if (s.indexOf('T') !== -1) s = s.split('T')[0];
  if (s.endsWith(' GM')) s = s + 'T';
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function formatDate(dateStr) {
  const d = safeParseDate(dateStr);
  if (!d) return '-';
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysUntil(dateStr) {
  const target = safeParseDate(dateStr);
  if (!target) return '';
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Sudah lewat';
  if (diff === 0) return 'Hari ini! 🎉';
  if (diff === 1) return 'Besok!';
  return `${diff} hari lagi`;
}

export default function DateCard({ item, type, onEdit, onDelete, onToggleVisited, onOpenSavings }) {
  const savingsPercent =
    type === 'longterm' && item.savingsTarget
      ? Math.min(100, Math.round(((item.savedAmount || 0) / item.savingsTarget) * 100))
      : 0;

  const isSavingsCompleted = type === 'longterm' && item.savingsTarget > 0 && (item.savedAmount || 0) >= item.savingsTarget;
  const daysLabel = getDaysUntil(item.date);
  const isPast = daysLabel === 'Sudah lewat';

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        item.visited
          ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
          : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300'
      }`}
    >
      {/* Header bar indicator */}
      <div
        className={`h-1.5 w-full ${
          item.visited
            ? 'bg-emerald-500'
            : type === 'longterm'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
            : 'bg-blue-600'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Row: Checkbox + Title + Actions */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Checkbox button */}
              <button
                type="button"
                onClick={() => onToggleVisited(item)}
                className="mt-0.5 flex-shrink-0 text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer"
                title={item.visited ? 'Tandai belum dikunjungi' : 'Tandai sudah dikunjungi'}
              >
                {item.visited ? (
                  <FiCheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                ) : (
                  <FiCircle className="w-5 h-5 hover:text-blue-500" />
                )}
              </button>

              {/* Title & Badge */}
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-base font-bold leading-snug break-words ${
                    item.visited ? 'text-slate-500' : 'text-slate-800'
                  }`}
                >
                  {item.name}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {item.visited ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                      Sudah kita kunjungi
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isPast
                          ? 'text-rose-600 bg-rose-50'
                          : 'text-blue-600 bg-blue-50'
                      }`}
                    >
                      <FiClock className="w-3 h-3" />
                      {daysLabel}
                    </span>
                  )}

                  {isSavingsCompleted && !item.visited && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      <FiAward className="w-3 h-3 text-indigo-600" />
                      Tabungan Siap! 🎉
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons (Edit & Delete) */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit data"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus destinasi"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Details list (Date & Location) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs sm:text-sm">
            {/* Tanggal */}
            <div className="flex items-center gap-2.5 text-slate-600">
              <FiCalendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="font-medium">{formatDate(item.date)}</span>
            </div>

            {/* Lokasi + Link Maps */}
            <div className="flex items-center justify-between gap-2 text-slate-600">
              <div className="flex items-center gap-2.5 min-w-0">
                <FiMapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="truncate font-medium" title={item.location}>
                  {item.location}
                </span>
              </div>
              {item.locationUrl ? (
                <a
                  href={item.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors flex-shrink-0"
                >
                  <FiExternalLink className="w-3 h-3" />
                  Maps
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location || item.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                  title="Cari lokasi di Google Maps"
                >
                  <FiExternalLink className="w-3 h-3" />
                  Cari di Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Long-term Tabungan Box */}
        {type === 'longterm' && item.savingsTarget > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <FaPiggyBank className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tabungan Kita</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold ${savingsPercent >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {savingsPercent}%
                  </span>
                  {onOpenSavings && (
                    <button
                      type="button"
                      onClick={() => onOpenSavings(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      <FiPlus className="w-3 h-3 stroke-[3]" />
                      Nabung
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    savingsPercent >= 100
                      ? 'bg-emerald-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${savingsPercent}%` }}
                />
              </div>

              {/* Amounts row */}
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                <span className={savingsPercent >= 100 ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
                  {formatCurrency(item.savedAmount || 0)}
                </span>
                <span>
                  Target: {formatCurrency(item.savingsTarget)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
