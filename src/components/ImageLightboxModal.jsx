import { useEffect, useState } from 'react';
import { FiX, FiMapPin, FiCalendar, FiDownload, FiLoader } from 'react-icons/fi';
import { formatImageUrl } from '../utils/imageUrl';

export default function ImageLightboxModal({ isOpen, imageUrl, title, subtitle, date, onClose }) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const finalUrl = formatImageUrl(imageUrl);

  // Sanitasi nama file dari judul
  const getFileName = () => {
    const base = (title || 'foto-kenangan-kita')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
    return `${base}.jpg`;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Fetch gambar sebagai blob agar download cross-origin bisa berjalan
      const res = await fetch(finalUrl, { referrerPolicy: 'no-referrer' });
      if (!res.ok) throw new Error('Gagal mengunduh gambar');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = getFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: buka di tab baru agar user bisa save manual
      console.warn('Download otomatis gagal, buka di tab baru:', err);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center animate-slide-up"
      >
        {/* Tombol Tutup & Download */}
        <div className="absolute -top-12 right-0 sm:top-2 sm:right-2 z-10 flex items-center gap-2">
          {/* Tombol Download */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-500/80 hover:bg-blue-500 disabled:bg-blue-500/40 text-white backdrop-blur-sm transition-all cursor-pointer shadow-lg text-xs font-bold"
            title="Unduh Foto"
          >
            {downloading ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiDownload className="w-4 h-4 stroke-[2.5]" />
            )}
            <span className="hidden sm:inline">{downloading ? 'Mengunduh...' : 'Unduh'}</span>
          </button>

          {/* Tombol Tutup */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all cursor-pointer shadow-lg"
            title="Tutup (Esc)"
          >
            <FiX className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Gambar HD */}
        <div className="w-full overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center max-h-[75vh]">
          <img
            src={finalUrl}
            referrerPolicy="no-referrer"
            alt={title || 'Foto'}
            className="w-full h-full max-h-[75vh] object-contain select-none"
          />
        </div>

        {/* Keterangan di bawah foto */}
        {(title || subtitle || date) && (
          <div className="mt-3 w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-xl">
            <div className="min-w-0">
              <h4 className="font-extrabold text-sm sm:text-base leading-snug truncate">
                {title}
              </h4>
              {subtitle && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5 truncate">
                  <FiMapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span className="truncate">{subtitle}</span>
                </div>
              )}
            </div>

            {date && (
              <div className="flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 px-3 py-1 rounded-lg w-fit flex-shrink-0">
                <FiCalendar className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
                <span>{date}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
