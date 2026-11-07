import { useState, useEffect } from 'react';
import { FiCalendar, FiHeart } from 'react-icons/fi';

export default function WelcomeSplash({ onFinish }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fading out after 1.5s
    const timer1 = setTimeout(() => {
      setFading(true);
    }, 1500);

    // Completely unmount after fade-out transition (total ~2s)
    const timer2 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white transition-all duration-500 ease-out ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute w-96 h-96 bg-indigo-400/10 rounded-full blur-2xl -top-12 -right-12" />

      {/* Main Content */}
      <div className="relative flex flex-col items-center text-center px-6">
        {/* Animated Icon Box */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl animate-float">
            <FiCalendar className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          {/* Pulsing Heart Badge */}
          <div className="absolute -bottom-2 -right-2 bg-rose-500 p-2.5 rounded-2xl shadow-lg animate-bounce">
            <FiHeart className="w-5 h-5 text-white fill-white" />
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white drop-shadow-md">
          List Date Kita
        </h1>
        <p className="text-blue-100 text-sm sm:text-base font-medium max-w-xs mb-8">
          Mulai rencanakan momen & perjalanan indah kita berdua ✨
        </p>

        {/* Loading Progress Bar */}
        <div className="w-44 h-1.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-white rounded-full animate-splash-progress" />
        </div>
      </div>
    </div>
  );
}

