/**
 * Normalisasi URL gambar Google Drive dan penyedia gambar lainnya
 * Menggunakan lh3.googleusercontent.com/d/{id} yang didukung no-referrer
 * sehingga gambar Google Drive dapat dimuat secara bebas tanpa terblokir oleh Google CDN.
 */

export function formatImageUrl(url) {
  if (!url) return '';
  const str = String(url).trim();
  if (str.startsWith('data:image') || str.startsWith('blob:')) return str;

  // Deteksi Google Drive File ID
  let driveId = null;
  const matchLh3 = str.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (matchLh3) driveId = matchLh3[1];

  const matchDrive = str.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|thumbnail\?id=)|[?&]id=)([a-zA-Z0-9_-]+)/);
  if (matchDrive) driveId = matchDrive[1];

  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  return str;
}
