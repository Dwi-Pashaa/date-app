import { useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiDatabase, FiExternalLink, FiCopy, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { api } from '../api';

export default function GoogleSheetsModal({ isOpen, onClose, onConnected }) {
  const [sheetsUrl, setSheetsUrlState] = useState(api.getSheetsUrl() || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { type: 'success' | 'error', message }
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isCurrentlyConnected = Boolean(api.getSheetsUrl());

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    if (!sheetsUrl.trim()) {
      setTestResult({ type: 'error', message: 'Silakan masukkan URL Web App Google Apps Script kamu.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const data = await api.testConnection(sheetsUrl.trim());
      api.setSheetsUrl(sheetsUrl.trim());
      setTestResult({
        type: 'success',
        message: data.message || 'Koneksi berhasil! Spreadsheet siap digunakan 💙',
      });
      setTimeout(() => {
        if (onConnected) onConnected();
      }, 800);
    } catch (err) {
      setTestResult({
        type: 'error',
        message: err.message || 'Gagal tersambung. Pastikan Web App disetting "Anyone" saat deploy.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    api.setSheetsUrl('');
    setSheetsUrlState('');
    setTestResult({ type: 'success', message: 'Telah diputus dari Google Spreadsheet. Mode offline aktif.' });
    if (onConnected) onConnected();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 animate-slide-up">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <FiDatabase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl">Koneksi Google Spreadsheet</h3>
                <p className="text-emerald-100 text-xs">Simpan data permanen di Google Drive pribadi kita</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isCurrentlyConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCurrentlyConnected ? (
                <FiCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Status Database</p>
                <p className="text-sm font-semibold">
                  {isCurrentlyConnected ? 'Tersambung ke Google Spreadsheet' : 'Penyimpanan Lokal (Belum Terhubung)'}
                </p>
              </div>
            </div>
            {isCurrentlyConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-white px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer shadow-xs"
              >
                Putuskan
              </button>
            )}
          </div>

          {/* Form URL Input */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                URL Google Apps Script Web App
              </label>
              <input
                type="url"
                value={sheetsUrl}
                onChange={(e) => setSheetsUrlState(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-slate-800 text-xs sm:text-sm font-mono placeholder:font-sans placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Dapatkan URL ini setelah menerapkan kode script di menu Extensions &gt; Apps Script.
              </p>
            </div>

            {/* Test Feedback Message */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                  testResult.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {testResult.type === 'success' ? (
                  <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={testing}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {testing ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    Simpan &amp; Sinkronkan
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Guide Accordion */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📖 Cara Cepat Menyiapkan Spreadsheet (2 Menit):</span>
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
              <li>
                Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline inline-flex items-center gap-0.5">Google Sheets Baru <FiExternalLink className="w-3 h-3" /></a> di akun Google kamu.
              </li>
              <li>
                Klik menu <b>Extensions</b> &gt; <b>Apps Script</b>.
              </li>
              <li>
                Buka file <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono">google-apps-script/Code.gs</code> di project ini, lalu salin seluruh kodenya ke editor Apps Script.
              </li>
              <li>
                Klik tombol biru <b>Deploy</b> &gt; <b>New deployment</b> &gt; pilih jenis <b>Web app</b>.
              </li>
              <li>
                Atur <b>Who has access</b> ke: <b>Anyone</b> *(Penting)*, lalu klik <b>Deploy</b>.
              </li>
              <li>
                Salin <b>Web app URL</b> yang muncul dan tempelkan ke kolom input di atas!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

