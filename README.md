# CyberWise — Learn Smart. Stay Secure.

[![Build & Deploy](https://img.shields.io/badge/Deployment-GitHub%20Pages-blue?logo=github)](https://farathra.github.io/CyberWise/)
[![Progressive Web App](https://img.shields.io/badge/PWA-Offline%20Ready-success?logo=pwa)](https://farathra.github.io/CyberWise/)
[![Bilingual UI](https://img.shields.io/badge/UI-English%20%7C%20Bahasa%20Indonesia-informational)](https://farathra.github.io/CyberWise/)
[![Tests](https://img.shields.io/badge/Tests-All%20Passed%20(6%2F6)-brightgreen)](https://farathra.github.io/CyberWise/)

**CyberWise** adalah platform edukasi interaktif berbasis Progressive Web Application (PWA) yang dirancang untuk membekali siswa dan pengguna digital dengan pengetahuan esensial seputar keamanan siber, privasi data, dan etika teknologi.

Aplikasi ini dapat diakses secara langsung di: **[https://farathra.github.io/CyberWise/](https://farathra.github.io/CyberWise/)**

Dengan antarmuka yang bersih, modern, dan mendukung mode Gelap (*Dark Mode*) maupun Terang (*Light Mode*), CyberWise dirancang 100% statis (*serverless*), aman, berorientasi privasi, dan dapat beroperasi penuh secara luring (*offline-capable*).

---

## 🌟 Fitur Utama (Core Features)

### 1. 📚 Modul Pembelajaran Terstruktur (Learn)
- 4 Bab Kurikulum Keamanan Siber lengkap dengan 14 sub-bab materi mendalam.
- Format Markdown interaktif dilengkapi daftar isi dinamis (*Table of Contents*), perkiraan waktu baca, indikator progres, dan video edukasi terintegrasi.
- Desain tipografi optimal untuk kenyamanan membaca di desktop maupun perangkat seluler.

### 2. ❓ Bank Soal & Ujian Interaktif (Quiz)
- **Kuis Per Sub-bab**: Evaluasi langsung pemahaman materi setelah membaca setiap sub-bab.
- **Kuis Komprehensif Per Bab**: Ujian akhir untuk menguji pemahaman seluruh bab.
- **Master Quiz**: Ujian berbobot 50 soal acak seimbang dari seluruh kurikulum.
- Fitur peninjauan jawaban salah (*Review Mistakes*), penjelasan rinci untuk setiap jawaban, pengacakan algoritma Fisher-Yates, dan pencatatan riwayat skor ke IndexedDB.

### 3. 🎮 5 Simulasi Permainan Keamanan Siber (Games Hub)
1. **Email Detective (Pemula)**: Investigasi email mencurigakan, analisis header pengirim, tautan tipuan (*typosquatting*), dan deteksi phishing.
2. **Chat Trap (Pemula - Menengah)**: Simulasi percakapan chat interaktif menghadapi rekayasa sosial (*social engineering*), penipuan OTP, hadiah palsu, dan impersonasi.
3. **Password Defender (Menengah)**: Strategi kekuatan sandi, pertahanan akun dengan MFA/2FA, dan respons insiden kebocoran data (*credential stuffing*).
4. **Cyber Incident Commander (Lanjutan)**: Simulasi komando insiden SOC profesional — mencakup triase peringatan, investigasi log forensik, kontainmen, eradikasi malware, dan laporan pasca-insiden (*After-Action Report*).
5. **Malware Mission (Lanjutan)**: Analisis keamanan berkas sebelum dieksekusi — mendeteksi ekstensi ganda (misal `.pdf.exe`), makro dokumen mencurigakan, entropy tinggi, sertifikat tidak valid, dan keputusan isolasi sistem.

### 4. 📊 Analisis Belajar & Rekomendasi Personal (Learning Analytics & Insights)
- **Dasbor Metrik KPI**: Progres materi, persentase kelulusan kuis, jumlah simulasi selesai, dan tanggal aktivitas terakhir.
- **Rekomendasi Personal Deterministik**: Saran langkah belajar berikutnya yang dihitung secara cerdas dari topik yang perlu perbaikan, tanpa memerlukan API eksternal atau backend server.
- **Target Belajar Mingguan (Weekly Goals)**: Pantau dan atur target baca materi dan pengerjaan kuis mingguan.
- **Matriks Penguasaan Topik**: Status topik per bab (*Selesai*, *Perlu Latihan*, *Sedang Berjalan*, *Belum Dimulai*).
- **Grafik Tren & Aktivitas**: Visualisasi SVG interaktif untuk perkembangan skor kuis dan volume aktivitas 7 hari terakhir, dilengkapi tabel ramah *screen reader* untuk aksesibilitas.
- **Ad-Blocker Proof**: Arsitektur netral yang kebal terhadap salah deteksi ekstensi pemblokir iklan/pelacak pada peramban.

### 5. 🔍 Pencarian Global (Global Search)
- Fitur pencarian instan dengan shortcut keyboard (`Ctrl + K` / `Cmd + K`).
- Mengindeks seluruh materi pelajaran, glosarium, catatan, dan permainan secara real-time.

### 6. 📖 Glosarium Keamanan Siber (Glossary)
- Kamus istilah keamanan digital lengkap dengan filter kategori alfabetik, pencarian instan, dan tautan silang ke materi terkait.

### 7. 📝 Catatan Pribadi (Personal Notes)
- Editor teks kaya WYSIWYG untuk membuat catatan belajar.
- Fitur autosave, sematkan catatan penting (*pin*), filter pencarian, serta ekspor & impor catatan.

### 8. 🌐 Bahasa Ganda (Bilingual UI: EN / ID)
- Antarmuka pengguna (*UI Chrome*) dapat dialihkan secara instan antara Bahasa Indonesia dan Bahasa Inggris tanpa *page reload*.
- Seluruh konten edukasi dan skenario pembelajaran tetap disajikan dalam Bahasa Indonesia yang baku dan komunikatif.

### 9. 💾 Pencadangan & Pemulihan (Backup & Restore)
- Simpan seluruh progres belajar, riwayat kuis, catatan, progres game, dan pengaturan ke berkas cadangan JSON tunggal.
- Pulihkan data kapan saja pada peramban atau perangkat yang berbeda.

---

## 🚀 Quick Start (Menjalankan Secara Lokal)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru.
- NPM (bawaan dari Node.js).

### Instalasi dan Menjalankan Server Lokal
```bash
# Clone repositori
git clone https://github.com/farathra/CyberWise.git
cd CyberWise

# Pasang dependensi
npm install

# Jalankan server pengembangan lokal (Vite)
npm run dev
```

Buka peramban dan akses alamat yang ditampilkan di terminal (biasanya `http://localhost:5173/CyberWise/`).

### Membangun Versi Produksi (*Build*)
```bash
npm run build
```
Hasil build siap saji akan dibuat di direktori `dist/`.

---

## 🧪 Skrip Pengujian Otomatis (Automated Testing)

CyberWise dilengkapi rangkaian pengujian otomatis end-to-end tanpa dependensi berat:

```bash
# Menjalankan seluruh rangkaian tes (6 test suites)
npm test

# Menjalankan validasi konten kurikulum dan soal kuis (420 soal)
npm run validate:full

# Menjalankan tes logika pencarian global
npm run test:search

# Menjalankan verifikasi glosarium
npm run test:glossary

# Menjalankan tes konsistensi & paritas kamus i18n (EN/ID)
npm run test:i18n

# Menjalankan tes seluruh skenario dan integrasi 5 game
npm run test:games

# Menjalankan tes perhitungan analitik & mesin rekomendasi
npm run test:analytics
```

---

## 📁 Struktur Proyek (Project Structure)

```
CyberWise/
├── index.html                   # App Shell utama HTML & dialog navigasi
├── package.json                 # Metadata proyek, skrip pengujian, & dependensi
├── vite.config.js               # Konfigurasi Vite bundler dan path GitHub Pages
├── README.md                    # Dokumentasi lengkap proyek
├── public/                      # Berkas statis PWA & Service Worker
│   ├── manifest.json            # Web App Manifest PWA
│   ├── sw.js                    # Service Worker (Offline caching & PWA)
│   └── icons/                   # Ikon vektor aplikasi
├── materi/                      # Modul Pembelajaran (Konten Kurikulum Markdown)
│   ├── manifest.json            # Metadata seluruh 14 sub-bab pembelajaran
│   ├── 1-a.md ... 1-c.md        # Bab 1: Keamanan Data dan Informasi
│   ├── 2-a.md ... 2-e.md        # Bab 2: Mengenal Dampak Teknologi Digital
│   ├── 3-a.md ... 3-d.md        # Bab 3: Malware (Malicious Software)
│   └── 4-a.md ... 4-b.md        # Bab 4: Meningkatkan Keamanan Data dan Informasi
├── quiz/                        # Bank Soal Ujian Interaktif
│   ├── manifest.json            # Konfigurasi kuis sub-bab & bab
│   ├── 1-a.json ... 1-c.json    # Bank soal kuis Bab 1
│   ├── 2-a.json ... 2-e.json    # Bank soal kuis Bab 2
│   ├── 3-a.json ... 3-d.json    # Bank soal kuis Bab 3
│   └── 4-a.json ... 4-b.json    # Bank soal kuis Bab 4
├── scripts/                     # Skrip Pengujian & Verifikasi Otomatis
│   ├── validate-content.js      # Validator kelengkapan materi & skema kuis
│   ├── test-search.js           # Verifikasi integrasi pencarian
│   ├── test-search-logic.js     # Verifikasi algoritma pencarian
│   ├── test-glossary.js         # Verifikasi glosarium
│   ├── test-i18n.js             # Verifikasi paritas terjemahan EN/ID
│   ├── test-games.js            # Verifikasi skenario 5 game edukasi
│   └── test-analytics.js        # Verifikasi metrik analitik & rekomendasi
└── src/                         # Kode Sumber Aplikasi
    ├── main.js                  # Titik masuk utama (Entry point) & router
    ├── app.js                   # Shell aplikasi: tema, bahasa, dialog modal
    ├── router.js                # Hash router kompatibel dengan GitHub Pages
    ├── storage.js               # Utilitas localStorage terisolasi
    ├── db.js                    # Wrapper IndexedDB (Catatan, Riwayat Kuis, Backup)
    ├── i18n.js                  # Kamus dwibahasa & engine lokalisasi
    ├── learn/                   # Modul Pembelajaran (Learn)
    │   ├── learn.js             # Controller modul belajar
    │   ├── dashboard.js         # Dasbor kurikulum & progress tracker
    │   ├── lesson.js            # Penampil materi Markdown & TOC
    │   └── progress.js          # Pengelola status penyelesaian materi
    ├── quiz/                    # Modul Kuis (Quiz)
    │   ├── quiz.js              # Tampilan pemilihan kuis & sesi ujian
    │   ├── engine.js            # Engine pengacakan soal (Fisher-Yates) & skor
    │   └── history.js           # Pencatatan riwayat skor kuis ke IndexedDB
    ├── games/                   # Modul Simulasi Permainan (Games)
    │   ├── gamesHub.js          # Hub daftar permainan & pelacak progres
    │   ├── gamesData.js         # Registrasi metadata 5 permainan
    │   ├── emailDetective/      # Game 1: Email Detective
    │   ├── chatTrap/            # Game 2: Chat Trap
    │   ├── passwordDefender/    # Game 3: Password Defender
    │   ├── incidentCommander/   # Game 4: Cyber Incident Commander
    │   └── malwareMission/      # Game 5: Malware Mission
    ├── insights/                # Modul Analisis Belajar & Rekomendasi
    │   ├── studyInsights.js     # UI Controller dasbor analitik & grafik
    │   ├── studyData.js         # Agregator metrik belajar & target mingguan
    │   └── recommendations.js   # Engine rekomendasi personal deterministik
    ├── notes/                   # Modul Catatan Pribadi (Notes)
    │   ├── notes.js             # Pengelola daftar catatan & ekspor
    │   └── editor.js            # Editor teks WYSIWYG
    ├── glossary/                # Modul Glosarium Istilah
    ├── search/                  # Modul Pencarian Global
    └── styles/                  # Arsitektur Desain Sistem Modular CSS
        ├── variables.css        # Desain token, tema Light/Dark, palet warna
        ├── base.css             # Reset CSS, utilitas dasar, tipografi
        ├── components.css       # Tombol, kartu, badge, modal, header
        ├── learn.css            # Gaya modul belajar & materi
        ├── quiz.css             # Gaya antarmuka ujian & hasil kuis
        ├── games.css            # Gaya simulasi 5 permainan siber
        ├── insights.css         # Gaya dasbor analitik & grafik SVG
        ├── notes.css            # Gaya editor catatan
        ├── glossary.css         # Gaya daftar istilah glosarium
        ├── search.css           # Gaya modal pencarian global
        └── main.css             # Titik import semua stylesheet
```

---

## 📚 Kurikulum & Sistem ID Stabil

CyberWise menerapkan sistem identifikasi konsisten di seluruh modul materi, kuis, dan penelusuran riwayat:

- **Bab 1: Keamanan Data dan Informasi**
  - `1-a`: Pengertian Keamanan Digital
  - `1-b`: Definisi Keamanan Data dan Informasi
  - `1-c`: Perbedaan Data dan Informasi dalam Konteks Keamanan
- **Bab 2: Mengenal Dampak Teknologi Digital**
  - `2-a`: Definisi Teknologi Digital
  - `2-b`: Peran Teknologi Digital dalam Kehidupan Sehari-hari
  - `2-c`: Perkembangan Teknologi Digital dari Masa ke Masa
  - `2-d`: Dampak Positif dan Negatif Teknologi Digital
  - `2-e`: Cara Mengatasi Dampak Negatif Teknologi Digital
- **Bab 3: Malware (Malicious Software)**
  - `3-a`: Pengertian Malware
  - `3-b`: Jenis-Jenis Malware
  - `3-c`: Cara Penyebaran Malware
  - `3-d`: Studi Kasus dan Contoh Nyata
- **Bab 4: Meningkatkan Keamanan Data dan Informasi**
  - `4-a`: Prinsip Dasar Keamanan Data dan Informasi
  - `4-b`: Teknik dan Strategi Penggunaan Data

---

## 🌐 Deployment ke GitHub Pages

CyberWise dirancang sepenuhnya statis dan kompatibel dengan **GitHub Pages**:

1. Basis path dikonfigurasi melalui Vite pada `/CyberWise/`.
2. Menggunakan **Hash-based Routing** (`#/learn`, `#/quiz`, `#/games`, `#/analytics`, `#/notes`, `#/glossary`) sehingga pengguna dapat me-refresh atau membagikan URL secara langsung tanpa kendala galat 404 pada server statis.
3. Service Worker mendukung cache offline yang efisien dengan pembaruan aset otomatis pada setiap rilis baru.

---

## 🛠️ Teknologi & Dependensi

- **Core & Bundler:** Vanilla JavaScript ES Modules, Vite 5.
- **PWA & Offline:** HTML5 Web App Manifest, Service Worker API (Cache-First + Network-First strategy).
- **Markdown Parser:** `marked.js` v13.
- **Keamanan & Sanitasi HTML:** `dompurify` v3 (Mencegah kerentanan injeksi XSS pada konten dinamis dan editor catatan).
- **Penyimpanan Klien:** `idb` v8 (IndexedDB untuk catatan, riwayat kuis, game data) dan `localStorage` (untuk preferensi tema, bahasa, dan sinkronisasi progres).
- **Styling:** Pure Modular CSS3 modern dengan CSS Custom Properties (Variabel Desain) tanpa framework tambahan.

---

## 👤 Atribusi & Pengembang

Dibuat dengan dedikasi untuk edukasi keamanan digital generasi muda Indonesia.

Pengembang: **Fardhan Athallah Raditya**  
Proyek: **CyberWise — *"Learn Smart. Stay Secure."***
