import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-slide-up max-w-sm w-full px-4 sm:px-0">
      <div
        className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
          isSuccess
            ? 'bg-emerald-600/95 text-white border-emerald-500 shadow-emerald-500/20'
            : 'bg-rose-600/95 text-white border-rose-500 shadow-rose-500/20'
        }`}
      >
        <div className="p-1 rounded-full bg-white/20 flex-shrink-0">
          {isSuccess ? <FiCheckCircle className="w-5 h-5" /> : <FiAlertCircle className="w-5 h-5" />}
        </div>
        <p className="text-sm font-semibold flex-1 leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
