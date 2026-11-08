import { FiMapPin, FiCheckCircle, FiTarget, FiCompass, FiClock } from 'react-icons/fi';
import { FaPiggyBank } from 'react-icons/fa';

export default function StatsBar({ monthlyDates, longTermDates, cityTrips = [], activeTab }) {
  if (activeTab === 'cities') {
    const totalCities = cityTrips.length;
    let allDestinations = [];
    cityTrips.forEach((c) => {
      if (Array.isArray(c.destinations)) {
        allDestinations = allDestinations.concat(c.destinations);
      }
    });

    const totalPlaces = allDestinations.length;
    const visitedPlaces = allDestinations.filter((d) => d.visited).length;
    const remainingPlaces = totalPlaces - visitedPlaces;

    const cityStats = [
      {
        label: 'Total Kota Tujuan',
        value: totalCities,
        icon: <FiCompass className="w-4 h-4 sm:w-5 sm:h-5" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
      },
      {
        label: 'Tempat Terjadwal',
        value: totalPlaces,
        icon: <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5" />,
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
      },
      {
        label: 'Sudah Dikunjungi',
        value: visitedPlaces,
        icon: <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
      },
      {
        label: 'Belum Dikunjungi',
        value: remainingPlaces,
        icon: <FiClock className="w-4 h-4 sm:w-5 sm:h-5" />,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
      },
    ];

    return (
      <div className="grid gap-3 mb-6 grid-cols-2 md:grid-cols-4">
        {cityStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center gap-3"
          >
            <div className={`${stat.bgColor} ${stat.textColor} p-2.5 rounded-lg flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 font-medium truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const list = activeTab === 'monthly' ? monthlyDates : longTermDates;
  const total = list.length;
  const visited = list.filter((d) => d.visited).length;
  const notVisited = total - visited;

  // Calculate total savings for long term
  const totalTarget = longTermDates.reduce((s, d) => s + (d.savingsTarget || 0), 0);
  const totalSaved = longTermDates.reduce((s, d) => s + (d.savedAmount || 0), 0);
  const savingsPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const stats = [
    {
      label: 'Total Destinasi',
      value: total,
      icon: <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Sudah Dikunjungi',
      value: visited,
      icon: <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Belum Dikunjungi',
      value: notVisited,
      icon: <FiTarget className="w-4 h-4 sm:w-5 sm:h-5" />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  if (activeTab === 'longterm') {
    stats.push({
      label: 'Tabungan Kita',
      value: `${savingsPercent}%`,
      icon: <FaPiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    });
  }

  return (
    <div
      className={`grid gap-3 mb-6 ${
        activeTab === 'longterm'
          ? 'grid-cols-2 md:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-3'
      }`}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center gap-3"
        >
          <div className={`${stat.bgColor} ${stat.textColor} p-2.5 rounded-lg flex-shrink-0`}>
            {stat.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
              {stat.value}
            </p>
            <p className="text-xs text-slate-500 font-medium truncate">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
