import { FiCalendar, FiTarget } from 'react-icons/fi';

export default function TabSelector({ activeTab, onTabChange, monthlyCt, longTermCt }) {
  return (
    <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
      <button
        onClick={() => onTabChange('monthly')}
        className={`flex items-center gap-2 px-5 sm:px-7 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
          activeTab === 'monthly'
            ? 'bg-white text-blue-600 shadow-md shadow-blue-100'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <FiCalendar className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'monthly' ? 'scale-110' : ''}`} />
        <span>Bulanan</span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
            activeTab === 'monthly'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {monthlyCt}
        </span>
      </button>

      <button
        onClick={() => onTabChange('longterm')}
        className={`flex items-center gap-2 px-5 sm:px-7 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
          activeTab === 'longterm'
            ? 'bg-white text-blue-600 shadow-md shadow-blue-100'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <FiTarget className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'longterm' ? 'scale-110' : ''}`} />
        <span>Jangka Panjang</span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
            activeTab === 'longterm'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {longTermCt}
        </span>
      </button>
    </div>
  );
}
