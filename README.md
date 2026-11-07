# 💙 List Date Kita

Aplikasi web modern, elegan, dan responsif untuk merencanakan destinasi kencan dan perjalanan indah berdua. Dibangun menggunakan **React (Vite)**, **Tailwind CSS**, **React Icons**, dan **Smart Storage** (bisa berjalan dengan JSON Server di lokal dan otomatis support deployment ke Vercel).

---

## ✨ Fitur Utama

- **🗓️ 2 Kategori Destinasi**:
  - **List Bulanan**: Destinasi santai rutin bulanan (makan malam, nonton bioskop, piknik, cafe).
  - **List Jangka Panjang**: Destinasi impian yang memerlukan tabungan (liburan ke luar kota, luar negeri).
- **💰 Sistem Tabungan Cepat (*Quick Savings*)**:
  - Input target tabungan dan jumlah yang telah terkumpul.
  - Animated progress bar persentase real-time.
  - Tombol **`+ Nabung`** langsung pada card untuk menambah tabungan tanpa repot membuka edit form.
  - Badge perayaan *"Tabungan Siap! 🎉"* saat target tercapai 100%.
- **📍 Integrasi Google Maps**:
  - Menyimpan tautan Google Maps untuk setiap destinasi.
  - Tombol badge **Maps ↗** langsung mengarah ke lokasi di Google Maps.
- **⏱️ Countdown Status**:
  - Perhitungan hari otomatis (*"15 hari lagi"*, *"Besok!"*, *"Hari ini! 🎉"*, *"Sudah lewat"*).
- **🔍 Live Search, Status Filter & Sorting**:
  - Pencarian instan nama tempat atau lokasi.
  - Filter status: *Semua*, *Belum*, dan *Selesai*.
  - Pengurutan: *Tanggal Terdekat*, *Tanggal Terjauh*, *Nama (A-Z)*, dan *Tabungan Terbanyak*.
- **📊 Quick Stats Dashboard**:
  - Ringkasan total destinasi, jumlah yang sudah dikunjungi, belum dikunjungi, dan progres tabungan.
- **🌟 Welcome Splash Animation**:
  - Animasi pembuka yang memukau saat pertama kali membuka website.
- **📱 Responsif Penuh**:
  - Tampilan optimal di perangkat Mobile (HP), Tablet, maupun Desktop.

---

## 🚀 Cara Menjalankan di Lokal

### 1. Jalankan Sekaligus (Rekomendasi)
```bash
npm start
```
*Perintah ini akan menjalankan backend (`json-server`) di port `3001` dan frontend (`Vite`) di port `5173` secara bersamaan.*

### 2. Atau Jalankan Manual di 2 Terminal Terpisah:

**Terminal 1 — Backend (JSON Server):**
```bash
npm run server
```
*Server REST API aktif di `http://localhost:3001` dengan database `db.json`.*

**Terminal 2 — Frontend (Vite Dev Server):**
```bash
npm run dev
```
*Aplikasi web aktif di `http://localhost:5173`.*

---

## 🌐 Cara Deploy ke Vercel (Gratis & Cepat)

Project ini **sudah 100% siap di-deploy ke Vercel**!

### Cara 1: Lewat GitHub (Paling Mudah)
1. Push project ini ke repository **GitHub** kamu.
2. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub kamu.
3. Klik **"Add New..."** lalu pilih **"Project"**.
4. Import repository GitHub project ini.
5. Vercel akan otomatis mendeteksi framework **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Klik **Deploy**! Dalam ~1 menit website kamu sudah online dengan URL gratis `https://nama-project.vercel.app`.

### Cara 2: Lewat Vercel CLI
```bash
npm install -g vercel
vercel
```

> **💡 Catatan Penyimpanan di Vercel:**  
> Vercel adalah platform *serverless* (tidak menjalankan background Node server untuk file lokal).  
> Sistem API aplikasi ini sudah dilengkapi **Smart Fallback**:  
> - Di komputer lokal: otomatis tersimpan ke file `db.json` via JSON Server.  
> - Di Vercel: otomatis tersimpan aman di browser masing-masing via `localStorage`. Semua fungsi CRUD (Tambah, Edit, Hapus, Nabung) tetap 100% berjalan sempurna!

---

Dibuat dengan 💙 untuk perjalanan indah kita berdua.
