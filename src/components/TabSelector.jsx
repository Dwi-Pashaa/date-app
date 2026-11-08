import { FiCalendar, FiTarget, FiMapPin } from 'react-icons/fi';

export default function TabSelector({ activeTab, onTabChange, monthlyCt, longTermCt, citiesCt = 0 }) {
  return (
    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap gap-1">
      {/* Tab Bulanan */}
      <button
        type="button"
        onClick={() => onTabChange('monthly')}
        className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
          activeTab === 'monthly'
            ? 'bg-white text-blue-600 shadow-md shadow-blue-100'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <FiCalendar className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'monthly' ? 'scale-110' : ''}`} />
        <span>Bulanan</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
            activeTab === 'monthly'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-slate-200 text-slate-500'
          }`}
        >
          {monthlyCt}
        </span>
      </button>

      {/* Tab Jangka Panjang */}
      <button
        type="button"
        onClick={() => onTabChange('longterm')}
        className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
          activeTab === 'longterm'
            ? 'bg-white text-blue-600 shadow-md shadow-blue-100'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <FiTarget className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'longterm' ? 'scale-110' : ''}`} />
        <span>Jangka Panjang</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
            activeTab === 'longterm'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-slate-200 text-slate-500'
          }`}
        >
          {longTermCt}
        </span>
      </button>

      {/* Tab Kota Tujuan */}
      <button
        type="button"
        onClick={() => onTabChange('cities')}
        className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
          activeTab === 'cities'
            ? 'bg-white text-blue-600 shadow-md shadow-blue-100'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <FiMapPin className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'cities' ? 'scale-110' : ''}`} />
        <span>Kota Tujuan</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
            activeTab === 'cities'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-slate-200 text-slate-500'
          }`}
        >
          {citiesCt}
        </span>
      </button>
    </div>
  );
}
