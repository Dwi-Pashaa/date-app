# 📊 Panduan Koneksi Google Spreadsheet (Database Cloud Kita)

Google Spreadsheet kita memiliki **3 Tab Terpisah Otomatis**:
1. **`MonthlyDates`** : Daftar kencan / date rutin bulanan kita.
2. **`LongTermDates`** : Rencana date impian jangka panjang beserta target & tabungan kita.
3. **`KotaTujuan`** : **Tab khusus terpisah** untuk daftar trip luar kota, tanggal berangkat & pulang, catatan perjalanan, serta daftar destinasi itinerary lengkap dengan jam kunjungannya.

---

### Cara Update Script (Jika Sudah Pernah Deploy Sebelumnya) ⚡
Jika kamu sudah memiliki spreadsheet dan ingin memperbarui script agar tab **`KotaTujuan`** otomatis dibuat:

1. Buka Google Sheet kamu, lalu klik **Extensions (Ekstensi)** > **Apps Script**.
2. Salin (**Copy**) seluruh isi kode terbaru dari [google-apps-script/Code.gs](file:///d:/web-list-gabungan/google-apps-script/Code.gs).
3. Hapus kode lama di editor Apps Script dan tempel (**Paste**) kode baru tersebut.
4. Klik tombol **Save** (ikon disket 💾 / `Ctrl + S`).
5. Di pojok kanan atas, klik tombol **Deploy** > **Manage deployments** (Kelola penerapan).
6. Klik ikon **Pensil (Edit)** di baris penerapan aktif kamu.
7. Di bagian **Version**, pilih **New version** (Versi baru).
8. Klik tombol **Deploy**.
9. Selesai! 🎉 Tab **`KotaTujuan`** akan langsung otomatis dibuat secara terpisah di Google Sheet kamu saat web dibuka atau data ditambahkan!

---

### Langkah Setup Dari Awal (Untuk Spreadsheet Baru)

#### Langkah 1: Buat Google Sheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser kamu.
2. Beri nama spreadsheet kamu, misalnya: **`Database List Date Kita`**.
3. *(Kamu tidak perlu membuat kolom atau tab manual, script akan membuatnya otomatis menjadi 3 tab terpisah!)*

#### Langkah 2: Buka Apps Script
1. Di menu atas Google Sheet kamu, klik: **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus semua kode default `function myFunction() { ... }` yang ada di editor.

#### Langkah 3: Paste Kode Script
1. Buka file [google-apps-script/Code.gs](file:///d:/web-list-gabungan/google-apps-script/Code.gs).
2. Salin (**Copy**) seluruh isinya dan tempel (**Paste**) ke Apps Script.
3. Klik tombol **Save** 💾 (`Ctrl + S`).

#### Langkah 4: Deploy sebagai Web App
1. Klik tombol **Deploy** > **New deployment** (Penerapan baru).
2. Di sebelah kiri (ikon gear ⚙️), pilih jenis: **Web app**.
3. Pengaturan:
   - **Description**: `API List Date Realtime`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` *(PENTING: Pilih "Anyone" / "Siapa saja")*
4. Klik **Deploy**.
5. Berikan izin akses (*Authorize access* > Akun Google > *Advanced* > *Go to ... (unsafe)* > *Allow*).
6. Salin (**Copy**) **Web app URL** yang muncul.

#### Langkah 5: Masukkan URL ke Web App Kita
1. Buka web aplikasi kita.
2. Klik tombol **"Koneksi Spreadsheet" 📊** di Header atas.
3. Tempel URL Web App kamu, lalu klik **"Simpan & Sinkronkan"**.
4. URL ini juga sudah tertanam otomatis di kode sumber web kita sehingga bisa langsung dibuka di HP/laptop mana pun tanpa setup ulang!
