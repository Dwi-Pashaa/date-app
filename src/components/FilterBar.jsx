import { FiSearch, FiCheckCircle, FiCircle, FiList, FiSliders } from 'react-icons/fi';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  isLongTerm,
}) {
  const filters = [
    { id: 'all', label: 'Semua', icon: FiList },
    { id: 'pending', label: 'Belum', icon: FiCircle },
    { id: 'visited', label: 'Selesai', icon: FiCheckCircle },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari tempat atau lokasi..."
          className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60 text-xs text-slate-600">
          <FiSliders className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent font-semibold outline-none cursor-pointer text-slate-700 text-xs"
          >
            <option value="newest">✨ Terbaru Ditambahkan</option>
            <option value="date-desc">📅 Tanggal Target Terbaru</option>
            <option value="date-asc">⏳ Tanggal Target Terdekat</option>
            <option value="name-asc">🔤 Nama (A - Z)</option>
            {isLongTerm && <option value="savings-desc">💰 Tabungan Terbanyak</option>}
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = statusFilter === f.id;
            return (
              <button
                type="button"
                key={f.id}
                onClick={() => onStatusFilterChange(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
