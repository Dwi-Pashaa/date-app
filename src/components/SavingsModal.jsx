import { useState } from 'react';
import { FiX, FiPlus, FiArrowUpRight } from 'react-icons/fi';
import { FaPiggyBank } from 'react-icons/fa';

function formatCurrency(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

export default function SavingsModal({ item, onSave, onClose }) {
  const [depositAmount, setDepositAmount] = useState('');
  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  const currentSaved = item.savedAmount || 0;
  const target = item.savingsTarget || 0;
  const additional = Number(depositAmount) || 0;
  const newTotal = currentSaved + additional;
  const newPercent = target > 0 ? Math.min(100, Math.round((newTotal / target) * 100)) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (additional <= 0) return;
    onSave({
      ...item,
      savedAmount: newTotal,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <FaPiggyBank className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg">Catat Tabungan</h3>
                <p className="text-xs text-blue-100 truncate max-w-[220px]">{item.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Status Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>Tabungan saat ini:</span>
              <span className="font-semibold text-slate-700">{formatCurrency(currentSaved)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>Target tabungan:</span>
              <span className="font-semibold text-slate-700">{formatCurrency(target)}</span>
            </div>
            {additional > 0 && (
              <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  <FiArrowUpRight className="w-3.5 h-3.5" /> Total setelah nabung:
                </span>
                <span className="font-bold text-blue-600">{formatCurrency(newTotal)} ({newPercent}%)</span>
              </div>
            )}
          </div>

          {/* Input Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Jumlah Yang Ditabung
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0"
                required
                autoFocus
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 font-bold text-lg"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <span className="text-xs text-gray-400 font-medium mb-1.5 block">Pilihan Cepat:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setDepositAmount(amt.toString())}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  +{amt >= 1000000 ? `${amt / 1000000} Jt` : `${amt / 1000} Rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={additional <= 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FiPlus className="w-4 h-4" />
              Simpan Tabungan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

