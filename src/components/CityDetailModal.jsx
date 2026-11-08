import { useState } from 'react';
import {
  FiX,
  FiPlus,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiExternalLink,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiCircle,
  FiCompass,
} from 'react-icons/fi';
import DestinationFormModal from './DestinationFormModal';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function CityDetailModal({
  isOpen,
  city,
  onClose,
  onUpdateCity,
}) {
  const [showDestModal, setShowDestModal] = useState(false);
  const [editDest, setEditDest] = useState(null);

  if (!isOpen || !city) return null;

  const destinations = city.destinations || [];

  // Sort destinations by Date and Time
  const sortedDestinations = [...destinations].sort((a, b) => {
    const dateComp = (a.date || '').localeCompare(b.date || '');
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });

  const visitedCount = destinations.filter((d) => d.visited).length;

  // Handlers for destinations inside this city
  const handleSaveDestination = (destData) => {
    let updatedDestinations = [];
    if (editDest) {
      updatedDestinations = destinations.map((d) =>
        d.id === editDest.id ? destData : d
      );
    } else {
      updatedDestinations = [...destinations, destData];
    }

    const updatedCity = {
      ...city,
      destinations: updatedDestinations,
    };

    onUpdateCity(updatedCity);
    setShowDestModal(false);
    setEditDest(null);
  };

  const handleDeleteDestination = (destId) => {
    const updatedDestinations = destinations.filter((d) => d.id !== destId);
    onUpdateCity({
      ...city,
      destinations: updatedDestinations,
    });
  };

  const handleToggleVisited = (destId) => {
    const updatedDestinations = destinations.map((d) =>
      d.id === destId ? { ...d, visited: !d.visited } : d
    );
    onUpdateCity({
      ...city,
      destinations: updatedDestinations,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-gray-100 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 p-5 sm:p-6 text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-blue-100">
                  Rencana Destinasi Kota
                </span>
                {destinations.length > 0 && (
                  <span className="text-xs font-bold bg-emerald-400 text-slate-900 px-2 py-0.5 rounded-full">
                    {visitedCount}/{destinations.length} Selesai
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black leading-tight break-words">
                {city.cityName}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 flex items-center gap-2">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>
                  {city.startDate} – {city.endDate}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action sub-header */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Jadwal Destinasi &amp; Jam Kunjungan
            </h4>
            <p className="text-[11px] text-slate-400">
              Disusun berurutan berdasarkan jam yang harus dikunjungi
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditDest(null);
              setShowDestModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex-shrink-0"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Tempat</span>
          </button>
        </div>

        {/* Content Body: Timeline list */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {sortedDestinations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
                <FiCompass className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-1">
                Belum ada tempat yang dijadwalkan
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                Tentukan destinasi seru, cafe, atau tempat wisata yang ingin kita kunjungi di {city.cityName}!
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditDest(null);
                  setShowDestModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <FiPlus className="w-3.5 h-3.5" />
                Tambah Tempat Pertama Kita
              </button>
            </div>
          ) : (
            sortedDestinations.map((dest, idx) => (
              <div
                key={dest.id || idx}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 justify-between ${
                  dest.visited
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-white border-slate-200/80 hover:border-blue-200 shadow-2xs'
                }`}
              >
                {/* Left: Checkbox + Time + Place details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Visited toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisited(dest.id)}
                    className="mt-1 flex-shrink-0 cursor-pointer text-slate-300 hover:text-emerald-500 transition-colors"
                    title={dest.visited ? 'Tandai belum dikunjungi' : 'Tandai sudah dikunjungi'}
                  >
                    {dest.visited ? (
                      <FiCheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <FiCircle className="w-5 h-5 hover:text-blue-500" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Time & Date Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/50">
                        <FiClock className="w-3.5 h-3.5" />
                        {dest.time || '-'}
                      </span>
                      {dest.date && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {formatDate(dest.date)}
                        </span>
                      )}
                      {dest.visited && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Sudah Dikunjungi
                        </span>
                      )}
                    </div>

                    {/* Place Name */}
                    <h4
                      className={`text-sm sm:text-base font-bold break-words ${
                        dest.visited ? 'text-slate-500' : 'text-slate-800'
                      }`}
                    >
                      {dest.placeName}
                    </h4>

                    {/* Location + Maps Link */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                      <FiMapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{dest.location}</span>
                      {dest.locationUrl && (
                        <a
                          href={dest.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors flex-shrink-0"
                        >
                          <FiExternalLink className="w-3 h-3" />
                          Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditDest(dest);
                      setShowDestModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit destinasi"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDestination(dest.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus destinasi"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Modal Tambah/Edit Destinasi */}
      {showDestModal && (
        <DestinationFormModal
          isOpen={showDestModal}
          city={city}
          editDest={editDest}
          onSave={handleSaveDestination}
          onClose={() => {
            setShowDestModal(false);
            setEditDest(null);
          }}
        />
      )}
    </div>
  );
}
