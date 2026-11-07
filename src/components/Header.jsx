import { FiCalendar, FiHeart } from 'react-icons/fi';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">List Date</h1>
                <span className="bg-blue-500/40 text-blue-100 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  Kita 💙
                </span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                Rencanakan destinasi jalan-jalan kita berdua
                <FiHeart className="w-3.5 h-3.5 text-pink-300 fill-pink-300 inline" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
