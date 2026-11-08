import { useState, useRef, useEffect } from 'react';
import { FiImage, FiUploadCloud, FiLink, FiX, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { api } from '../api';
import { formatImageUrl } from '../utils/imageUrl';

export default function ImageUploadInput({
  value,
  onChange,
  onUploadStatusChange,
  label = 'Foto',
  placeholder = 'Pilih foto atau tempel URL gambar',
}) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState(
    value && !value.startsWith('blob:') && !(value.startsWith('data:image') && value.length > 500000)
      ? value
      : ''
  );
  const [localPreview, setLocalPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Filter out any broken blob: URLs from previous sessions or huge data: URIs
  const isValidUrl = (v) => {
    if (!v) return false;
    if (v.startsWith('blob:')) return false;
    // data:image besar yang terpotong di Sheets → buang
    if (v.startsWith('data:image') && v.length > 500000) return false;
    return true;
  };
  const effectiveValue = isValidUrl(value) ? value : '';
  const displayImage = localPreview || effectiveValue;

  useEffect(() => {
    if (value && !value.startsWith('blob:') && !(value.startsWith('data:image') && value.length > 500000)) {
      setUrlInput(value);
    }
  }, [value]);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    setUploadError('');
    if (onUploadStatusChange) onUploadStatusChange(true);

    // 1. Tampilkan preview lokal di UI saja (JANGAN simpan blob: ke database)
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);

    try {
      // 2. Unggah ke Google Drive via Apps Script
      const cloudUrl = await api.uploadPhoto(file);
      if (cloudUrl && cloudUrl.startsWith('http')) {
        onChange(cloudUrl);
        setUrlInput(cloudUrl);
        // Preload gambar agar sudah di cache browser saat kartu ditampilkan
        const preloadImg = new Image();
        preloadImg.referrerPolicy = 'no-referrer';
        preloadImg.src = cloudUrl;
      } else if (cloudUrl && cloudUrl.startsWith('data:image')) {
        // Fallback base64 jika Drive belum aktif
        onChange(cloudUrl);
      } else {
        throw new Error('Gagal mendapatkan link foto dari Google Drive.');
      }
    } catch (err) {
      console.error('Gagal upload gambar:', err);
      setUploadError(
        'Upload ke Google Drive perlu izin. Buka Apps Script lalu jalankan fungsi "authorizeDriveApp".'
      );
    } finally {
      setUploading(false);
      if (onUploadStatusChange) onUploadStatusChange(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setLocalPreview('');
      onChange(urlInput.trim());
      setUploadError('');
    }
  };

  const handleRemove = () => {
    setLocalPreview('');
    onChange('');
    setUrlInput('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <FiImage className="w-3.5 h-3.5 text-blue-600" />
          {label} <span className="text-slate-400 font-normal normal-case">(opsional)</span>
        </label>

        {/* Tab switch mode upload vs URL */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              setUploadError('');
            }}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              mode === 'upload' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:text-slate-700'
            }`}
          >
            Galeri / File
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('url');
              setUploadError('');
            }}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              mode === 'url' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:text-slate-700'
            }`}
          >
            Link URL
          </button>
        </div>
      </div>

      {/* Jika sudah ada foto yang dipilih atau preview */}
      {displayImage ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-48 flex items-center justify-center">
          <img
            src={formatImageUrl(displayImage)}
            referrerPolicy="no-referrer"
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              const currentSrc = e.currentTarget.src;
              if (currentSrc.includes('thumbnail?id=')) {
                const idMatch = currentSrc.match(/id=([a-zA-Z0-9_-]+)/);
                if (idMatch) {
                  e.currentTarget.src = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
                  return;
                }
              }
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
            }}
          />

          {uploading && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 text-xs font-bold p-3 text-center">
              <FiLoader className="w-5 h-5 animate-spin text-blue-400" />
              <span>Sedang mengompres &amp; mengunggah ke Drive...</span>
            </div>
          )}

          {!uploading && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => {
                  if (mode === 'upload') {
                    fileInputRef.current?.click();
                  } else {
                    handleRemove();
                  }
                }}
                className="px-2.5 py-1 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 text-[11px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                title="Hapus Foto"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : mode === 'upload' ? (
        /* Dropzone Upload */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-blue-500 bg-blue-50/60'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
            {uploading ? (
              <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
              <FiUploadCloud className="w-5 h-5" />
            )}
          </div>
          <p className="text-xs font-bold text-slate-700 mb-0.5">
            {uploading ? 'Mengompres & mengunggah...' : 'Pilih Foto dari Galeri / Kamera'}
          </p>
          <p className="text-[11px] text-slate-400">
            JPG, PNG, atau WebP (otomatis dikompres ringan)
          </p>
        </div>
      ) : (
        /* Input Link URL */
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... atau link foto web"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-xs sm:text-sm text-slate-800"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span>Pasang</span>
          </button>
        </div>
      )}

      {/* Peringatan error upload jika ada */}
      {uploadError && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/80 text-xs">
          <FiAlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">{uploadError}</p>
        </div>
      )}
    </div>
  );
}
