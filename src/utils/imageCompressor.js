/**
 * Kompresi gambar sisi klien menggunakan HTML5 Canvas
 * Mengubah file gambar dari kamera/galeri (hingga 10MB+) menjadi WebP/JPEG ringan (~150-300KB)
 * dengan resolusi optimal (max 1200px) sebelum dikirim ke Google Drive via Apps Script.
 */

export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar yang valid.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Pertahankan rasio aspek
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Coba format WebP terlebih dahulu, fallback ke JPEG
        let mimeType = 'image/webp';
        let base64 = canvas.toDataURL(mimeType, quality);

        if (!base64.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          base64 = canvas.toDataURL(mimeType, quality);
        }

        resolve({
          base64,
          mimeType,
          fileName: file.name ? file.name.replace(/\.[^/.]+$/, '') + (mimeType === 'image/webp' ? '.webp' : '.jpg') : 'photo.webp',
          width,
          height,
        });
      };

      img.onerror = (err) => reject(new Error('Gagal memproses file gambar.'));
    };

    reader.onerror = (err) => reject(new Error('Gagal membaca file gambar.'));
  });
}

