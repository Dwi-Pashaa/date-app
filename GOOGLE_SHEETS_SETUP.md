# 📊 Panduan Koneksi Google Spreadsheet (Database Cloud Kita)

Ikuti langkah mudah di bawah ini (hanya butuh waktu ~2 menit):

---

### Langkah 1: Buat Google Sheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser kamu.
2. Beri nama spreadsheet kamu, misalnya: **`Database List Date Kita`**.
3. *(Kamu tidak perlu membuat tabel manual, script akan membuatnya secara otomatis!)*

---

### Langkah 2: Buka Apps Script
1. Di menu atas Google Sheet kamu, klik: **Extensions** (Ekstensi) > **Apps Script**.
2. Akan terbuka tab baru Google Apps Script editor.
3. Hapus semua kode default `function myFunction() { ... }` yang ada di editor.

---

### Langkah 3: Paste Kode Script
1. Buka file [google-apps-script/Code.gs](file:///d:/web-list-gabungan/google-apps-script/Code.gs) di project ini.
2. Salin (**Copy**) seluruh isi kodenya.
3. Tempel (**Paste**) ke dalam editor Apps Script tadi.
4. Klik tombol **Save** (ikon disket 💾) atau tekan `Ctrl + S`.

---

### Langkah 4: Deploy sebagai Web App
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy** > **New deployment** (Penerapan baru).
2. Di sebelah kiri (ikon gear ⚙️), pilih jenis: **Web app**.
3. Atur pengaturannya:
   - **Description**: `API List Date`
   - **Execute as**: `Me (email kamu)`
   - **Who has access**: `Anyone` *(PENTING: Pilih "Anyone" / "Siapa saja" agar web kamu bisa mengakses data)*
4. Klik **Deploy**.
5. Jika muncul jendela izin *Authorization Required*:
   - Klik **Authorize access**.
   - Pilih akun Google kamu.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik **Advanced** (Lanjutan) lalu klik **Go to Untitled project (unsafe)**.
   - Klik **Allow** (Izinkan).
6. Salin (**Copy**) URL yang muncul di bagian **Web app URL**  
   *(Contoh format URL: `https://script.google.com/macros/s/AKfycbx.../exec`)*.

---

### Langkah 5: Tempel URL di Aplikasi Web Kita
1. Buka aplikasi web **List Date** (di browser kamu atau di Vercel).
2. Klik tombol **"Koneksi Spreadsheet" 📊** di bagian Header atas.
3. Tempel URL Web App yang sudah kamu salin tadi.
4. Klik **"Simpan & Sinkronkan"**.
5. Selesai! 🎉 Sekarang seluruh data kamu tersimpan permanen di Google Sheet dan bisa diakses berdua secara real-time dari HP maupun laptop mana pun!

