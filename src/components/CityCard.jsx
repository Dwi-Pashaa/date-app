import {
  FiMapPin,
  FiCalendar,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiArrowRight,
} from 'react-icons/fi';

function formatDateRange(startDate, endDate) {
  if (!startDate) return '-';
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  const startStr = start.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (!endDate || startDate === endDate) return startStr;

  const endStr = end.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${startStr} – ${endStr}`;
}

function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (days <= 0) return '1 Hari';
  const nights = days - 1;
  return `${days} Hari ${nights > 0 ? `${nights} Malam` : ''}`.trim();
}

export default function CityCard({ city, onEdit, onDelete, onOpenDetail }) {
  const destinations = city.destinations || [];
  const totalDest = destinations.length;
  const visitedDest = destinations.filter((d) => d.visited).length;
  const durationLabel = calculateDays(city.startDate, city.endDate);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top accent line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500" />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiCompass className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug break-words">
                  {city.cityName}
                </h3>
                {durationLabel && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {durationLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => onEdit(city)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Kota"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(city)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus Kota"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
            {/* Tanggal Mulai - Selesai */}
            <div className="flex items-center gap-2.5">
              <FiCalendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="font-semibold text-slate-700">
                {formatDateRange(city.startDate, city.endDate)}
              </span>
            </div>

            {/* Catatan trip jika ada */}
            {city.notes && (
              <p className="text-xs text-slate-500 italic line-clamp-2 pl-6">
                "{city.notes}"
              </p>
            )}
          </div>
        </div>

        {/* Footer / Itinerary Button */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-3 text-xs">
            <span className="text-slate-500 font-medium">
              Destinasi Kita: <strong className="text-slate-800">{totalDest} Tempat</strong>
            </span>
            {totalDest > 0 && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                {visitedDest}/{totalDest} Selesai
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenDetail(city)}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs sm:text-sm font-bold border border-blue-200 hover:border-transparent transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white"
          >
            <span>Buka Jadwal &amp; Destinasi</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

