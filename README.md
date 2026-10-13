# CyberWise — Learn Smart. Stay Secure.

**CyberWise** adalah platform edukasi interaktif berbasis Progressive Web Application (PWA) yang dirancang untuk membekali siswa dan pengguna digital dengan pengetahuan esensial seputar keamanan siber, privasi data, dan etika teknologi.

Dengan antarmuka yang bersih, modern, dan mendukung mode Gelap (*Dark Mode*) maupun Terang (*Light Mode*), CyberWise dapat diakses secara daring maupun luring (*offline-capable*).

---

## 🚀 Quick Start (Memulai Cepat)

### Prasyarat
- Node.js versi 18+ terinstal di sistem Anda.
- NPM (Node Package Manager).

### Instalasi dan Menjalankan Server Lokal
```bash
# Masuk ke direktori proyek
cd "d:\Fardhan\SMP Global Andalan\9A\CyberWise"

# Pasang dependensi
npm install

# Jalankan server pengembangan Vite
npm run dev
```

Buka peramban (*browser*) Anda dan akses tautan lokal yang ditampilkan (biasanya `http://localhost:5173/`).

---

## 📁 Struktur Proyek (Project Structure)

```
CyberWise/
├── index.html                   # App Shell utama HTML
├── package.json                 # Konfigurasi dependensi dan skrip proyek
├── vite.config.js               # Konfigurasi Vite bundler dan static assets
├── README.md                    # Dokumentasi lengkap proyek
├── public/                      # Berkas statis untuk PWA & Service Worker
│   ├── manifest.json            # Web App Manifest PWA
│   ├── sw.js                    # Service Worker (Cache-first & Network-first)
│   └── icons/
│       └── icon.svg             # Ikon vektor aplikasi
├── materi/                      # Modul Pembelajaran (Konten Kurikulum)
│   ├── manifest.json            # Daftar metadata seluruh sub-bab pembelajaran
│   ├── 1-a.md ... 1-c.md        # Bab 1: Keamanan Data dan Informasi
│   ├── 2-a.md ... 2-e.md        # Bab 2: Mengenal Dampak Teknologi Digital
│   ├── 3-a.md ... 3-d.md        # Bab 3: Malware (Malicious Software)
│   └── 4-a.md ... 4-b.md        # Bab 4: Meningkatkan Keamanan Data dan Informasi
├── quiz/                        # Bank Soal Ujian Interaktif
│   ├── manifest.json            # Metadata konfigurasi kuis sub-bab
│   ├── 1-a.json ... 1-c.json    # Bank soal kuis Bab 1
│   ├── 2-a.json ... 2-e.json    # Bank soal kuis Bab 2
│   ├── 3-a.json ... 3-d.json    # Bank soal kuis Bab 3
│   └── 4-a.json ... 4-b.json    # Bank soal kuis Bab 4
├── scripts/
│   └── validate-content.js      # Skrip validasi integritas konten dan skema JSON
└── src/                         # Kode Sumber Aplikasi
    ├── main.js                  # Titik masuk utama aplikasi (Entry Point)
    ├── app.js                   # Shell logika: tema, navigasi tab
    ├── router.js                # Hash router kompatibel dengan GitHub Pages
    ├── storage.js               # Utilitas localStorage
    ├── db.js                    # Wrapper IndexedDB untuk catatan & riwayat kuis
    ├── learn/                   # Modul Pembelajaran (Learn)
    │   ├── learn.js             # Router & controller modul belajar
    │   ├── dashboard.js         # Dasbor kurikulum & progress tracker
    │   ├── lesson.js            # Penampil materi Markdown & TOC
    │   └── progress.js          # Pengelola status penyelesaian materi
    ├── quiz/                    # Modul Kuis (Quiz)
    │   ├── quiz.js              # Tampilan pemilihan kuis, sesi ujian, & hasil
    │   ├── engine.js            # Logika pengacakan soal (Fisher-Yates) & penilaian
    │   └── history.js           # Pencatatan riwayat skor kuis ke IndexedDB
    ├── notes/                   # Modul Catatan Pribadi (Notes)
    │   ├── notes.js             # Daftar catatan, pencarian, pin, ekspor/impor
    │   └── editor.js            # Editor teks kaya WYSIWYG & autosave
    └── styles/                  # Arsitektur CSS Terstruktur
        ├── variables.css        # Desain token, palet warna, tipografi, tema
        ├── base.css             # Reset CSS & elemen dasar
        ├── components.css       # Tombol, kartu, badge, navigasi, header
        ├── learn.css            # Gaya modul belajar, TOC, progress bar baca
        ├── quiz.css             # Gaya sesi ujian, opsi jawaban, skor hasil
        ├── notes.css            # Gaya daftar kartu catatan & editor WYSIWYG
        └── main.css             # Titik import semua berkas CSS
```

---

## 📚 Sistem ID Stabil & Kurikulum (Stable ID System)

CyberWise menggunakan identifikasi konsisten untuk memastikan keterkaitan antar-materi, kuis, dan riwayat belajar tetap sinkron:

- **Chapter 1: Keamanan Data dan Informasi**
  - `1-a`: Pengertian Keamanan Digital
  - `1-b`: Definisi Keamanan Data dan Informasi
  - `1-c`: Perbedaan Data dan Informasi dalam Konteks Keamanan
- **Chapter 2: Mengenal Dampak Teknologi Digital**
  - `2-a`: Definisi Teknologi Digital
  - `2-b`: Peran Teknologi Digital dalam Kehidupan Sehari-hari
  - `2-c`: Perkembangan Teknologi Digital dari Masa ke Masa
  - `2-d`: Dampak Positif dan Negatif Teknologi Digital
  - `2-e`: Cara Mengatasi Dampak Negatif Teknologi Digital
- **Chapter 3: Malware (Malicious Software)**
  - `3-a`: Pengertian Malware
  - `3-b`: Jenis-Jenis Malware
  - `3-c`: Cara Penyebaran Malware
  - `3-d`: Studi Kasus dan Contoh Nyata
- **Chapter 4: Meningkatkan Keamanan Data dan Informasi**
  - `4-a`: Prinsip Dasar Keamanan Data dan Informasi
  - `4-b`: Teknik dan Strategi Penggunaan Data

---

## 📝 Format Manifest Materi & Menambahkan Pelajaran

Metadata materi dikelola di `materi/manifest.json`:
```json
{
  "lessons": [
    {
      "id": "1-a",
      "chapterId": "1",
      "chapterTitle": "Keamanan Data dan Informasi",
      "title": "Pengertian Keamanan Digital",
      "file": "materi/1-a.md",
      "videoId": ""
    }
  ]
}
```

### Format Berkas Markdown Pelajaran
Setiap berkas materi (`materi/*.md`) harus memiliki:
1. Blok YAML frontmatter di bagian atas.
2. Judul `#` utama, sub-judul `##` dan `###`.
3. Teks tebal (*bold*) dan miring (*italic*).
4. Daftar poin (*bullet list*).
5. Contoh praktis kontekstual.
6. Bagian `## Rangkuman` di bagian akhir.

---

## ❓ Skema Kuis & Panduan Integrasi Phase 2

Setiap berkas kuis di `quiz/*.json` mengikuti skema berikut:
```json
{
  "questions": [
    {
      "id": "1-a-001",
      "chapterId": "1",
      "subchapterId": "1-a",
      "question": "Apa yang dimaksud dengan keamanan digital?",
      "options": [
        "Pilihan A",
        "Pilihan B",
        "Pilihan C",
        "Pilihan D"
      ],
      "answer": 1,
      "explanation": "Penjelasan rinci mengapa opsi tersebut adalah jawaban yang benar.",
      "difficulty": "easy"
    }
  ]
}
```

### Panduan Phase 2 (Peningkatan Bank Soal Penuh)
- **Phase 1 (Saat ini):** Menyediakan 5 soal contoh per sub-bab (total 70 soal). Kuis Master (50 soal acak seimbang antar-bab) dapat dijalankan karena total soal melebihi 50.
- **Phase 2:** Tambahkan 25 soal baru per sub-bab hingga mencapai 30 soal per sub-bab (total 420 soal untuk seluruh kurikulum). Format ID soal menggunakan pola `{subchapterId}-001` hingga `{subchapterId}-030`.

---

## 🧪 Validasi Konten (Content Validator)

Gunakan skrip validator otomatis bawaan untuk memastikan tidak ada kesalahan format, ID ganda, atau tautan berkas yang rusak:

```bash
# Validasi Mode Phase 1 (Struktural)
npm run validate

# Validasi Penuh untuk Phase 2 (Memeriksa kelengkapan 420 soal)
npm run validate:full
```

---

## 🌐 Deployment ke GitHub Pages

CyberWise dirancang sepenuhnya statis dan kompatibel dengan hosting gratis seperti **GitHub Pages**:

1. Tentukan variabel lingkungan basis path saat build:
```bash
# Contoh jika repositori GitHub bernama 'cyberwise'
$env:VITE_BASE_PATH="/cyberwise/"
npm run build
```
2. Direktori `dist/` siap diunggah ke branch `gh-pages` atau via GitHub Actions.
3. Karena menggunakan Hash-based routing (`#/learn`, `#/quiz`, `#/notes`), navigasi halaman tidak akan menghasilkan galat 404 saat pengguna me-refresh halaman pada GitHub Pages.

---

## 🛠️ Tech Stack & Dependensi

- **Runtime & Bundler:** Vanilla JavaScript ES Modules, Vite 5.
- **Markdown Rendering:** `marked.js` v13.
- **HTML Sanitizer:** `dompurify` v3 (Mencegah kerentanan XSS pada konten dinamis dan catatan).
- **Client Storage:** `idb` v8 (IndexedDB untuk penyimpanan catatan terstruktur & riwayat ujian) dan `localStorage` (untuk preferensi tema dan progres baca).
- **Gaya Tampilan:** Pure Modular CSS tanpa framework eksternal, mendukung variabel tema dinamis (Light/Dark).

---

## ⚠️ Batasan dan Catatan Implementasi

1. **Catatan Lokal (Local Storage):** Catatan yang dibuat pada modul *Notes* disimpan secara lokal di peramban menggunakan IndexedDB dan tidak disinkronkan ke server eksternal demi menjaga privasi pengguna. Pengguna dapat memanfaatkan fitur *Export All* untuk membuat cadangan berkas JSON.
2. **Video Streaming:** Tautan video (YouTube embed) memerlukan koneksi internet aktif. Namun seluruh modul teks materi, kuis, dan editor catatan berfungsi sepenuhnya saat offline berkat Service Worker.
3. **PWA Icon:** PWA menggunakan ikon berbasis format SVG vector mandiri `icons/icon.svg`.

---

## 👤 Atribusi & Hak Cipta

Dibuat dengan dedikasi untuk edukasi keamanan digital generasi muda Indonesia.

Made by **Fardhan Athallah Raditya**  
*CyberWise — "Learn Smart. Stay Secure."*
