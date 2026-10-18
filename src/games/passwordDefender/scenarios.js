// src/games/passwordDefender/scenarios.js
// Curated Password Defender scenarios spanning 3 connected modes:
// Mode A: Password Strategy (Evaluating length, uniqueness, passphrase, password managers)
// Mode B: Account Defense (MFA configuration, passkeys, recovery codes, active sessions)
// Mode C: Breach Response (Incident triage, credential exposure, MFA fatigue, remediation order)
// Lesson IDs strictly reference existing lessons in materi/manifest.json.

export const PASSWORD_SCENARIOS = [
  // ── Mode A: Password Strategy (3 scenarios) ─────────────────
  {
    id: 'pd-01',
    mode: 'mode-a',
    difficulty: 'intermediate',
    title: 'Kekuatan Kata Sandi: Kompleksitas Pendek vs Frasa Sandi (Passphrase)',
    account: {
      name: 'Email Utama & Pemulihan Akun',
      type: 'Surel Pribadi (Akun Kunci)',
      initialConfig: 'Kata sandi saat ini: P@$$w0rd2026! (12 karakter, pola tebakan umum)',
      alertOrDiscovery: 'Sistem menyarankan pembaruan kata sandi akun email induk yang menjadi pintu pemulihan semua akun media sosial Anda.'
    },
    evidence: [
      'Kata sandi lama menggunakan substitusi leetspeak umum (@ untuk a, $ untuk s) yang sudah ada di kamus tebakan peretas (dictionary attack).',
      'Akun email utama mengontrol akses reset kata sandi ke akun perbankan, media sosial, dan cloud drive.'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Ganti ke kata sandi acak 8 karakter dengan banyak simbol rumit: %k9#Z!2m',
        safety: 'adequate',
        score: 50,
        outcome: 'Meskipun acak, panjang 8 karakter dapat dibobol mesin komputasi modern (brute force) dalam hitungan menit/jam, dan sangat sulit diingat tanpa aplikasi.'
      },
      {
        id: 'opt-b',
        text: 'Gunakan frasa sandi (passphrase) panjang dari 4–5 kata acak yang mudah diingat: kucing-bersepatu-melompati-pagar-biru',
        safety: 'optimal',
        score: 100,
        outcome: 'Pilihan paling kokoh! Panjang 38 karakter memberikan tingkat entropi astronomis yang mustahil di-brute force, namun mudah diingat oleh pemilik akun.'
      },
      {
        id: 'opt-c',
        text: 'Ganti ke variasi nama pribadi dan angka tahun: FardhanCyber2026!',
        safety: 'hazardous',
        score: 0,
        outcome: 'Sangat berisiko! Menggunakan identitas pribadi yang dapat ditemukan di media sosial memudahkan penyerang menebak sandi Anda.'
      },
      {
        id: 'opt-d',
        text: 'Pertahankan kata sandi lama karena sudah ada huruf besar, angka, dan simbol.',
        safety: 'hazardous',
        score: 10,
        outcome: 'Berbahaya karena kata sandi lama berbasis kata kamus "password" yang selalu dicoba pertama kali oleh bot peretas.'
      }
    ],
    principle: 'Panjang karakter (length) dan ketidakterdugaan mengalahkan sekadar kompleksitas trik simbol pendek. Standar keamanan modern merekomendasikan passphrase yang panjang atau sandi acak dari Password Manager.',
    remediation: 'Buat frasa sandi (passphrase) minimal 16–20 karakter yang terdiri dari gabungan kata tak terduga, atau simpan kata sandi acak unik di brankas Password Manager tepercaya.',
    conceptKey: 'Passphrase & Entropi Panjang Sandi',
    relatedLessonId: '4-a'
  },
  {
    id: 'pd-02',
    mode: 'mode-a',
    difficulty: 'intermediate',
    title: 'Ancaman Penggunaan Ulang Kata Sandi (Password Reuse)',
    account: {
      name: 'Forum Komunitas Game & Akun Media Sosial',
      type: 'Multi-Akun (5 Layanan Berbeda)',
      initialConfig: 'Kata sandi sama persis: GarudaKuat#88 digunakan di forum game, toko online, media sosial, dan email.',
      alertOrDiscovery: 'Forum game lokal yang sistem keamanannya sederhana mengalami kebocoran database pengguna ke publik.'
    },
    evidence: [
      'Database forum game bocor memuat alamat email dan hash kata sandi pengguna.',
      'Penyerang mengumpulkan daftar kredensial bocor untuk menjalankan serangan Credential Stuffing ke platform perbankan dan email populer.'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Cukup ganti kata sandi di forum game saja, akun lain tidak perlu karena tidak pernah dibobol.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Bencana keamanan! Penyerang langsung menggunakan pasangan email dan sandi yang bocor dari forum game untuk membobol media sosial dan email Anda.'
      },
      {
        id: 'opt-b',
        text: 'Segera ganti kata sandi di seluruh akun lain dengan kata sandi unik yang berbeda-beda, dan mulai gunakan Password Manager.',
        safety: 'optimal',
        score: 100,
        outcome: 'Langkah pengamanan sempurna! Memutus efek domino kebocoran data sehingga kompromi pada satu situs murah tidak membahayakan akun penting lainnya.'
      },
      {
        id: 'opt-c',
        text: 'Tambahkan angka "1" di belakang kata sandi yang sama di semua akun: GarudaKuat#881',
        safety: 'hazardous',
        score: 10,
        outcome: 'Pola ini sangat mudah diprediksi oleh skrip otomatis penyerang yang menguji variasi angka di akhir sandi bocor.'
      },
      {
        id: 'opt-d',
        text: 'Hapus akun forum game dan buat akun baru dengan sandi yang sama.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Menghapus akun tidak membatalkan database kredensial yang sudah terlanjur beredar di tangan peretas.'
      }
    ],
    principle: 'Satu akun, satu kata sandi unik. Serangan Credential Stuffing terjadi ketika kebocoran pada situs kecil berkeamanan rendah dipakai untuk menjebol akun-akun penting korban yang menggunakan sandi kembar.',
    remediation: 'Gunakan Password Manager untuk menghasilkan dan menyimpan kata sandi unik bagi setiap akun, sehingga kompromi pada satu layanan tidak merembet ke layanan lain.',
    conceptKey: 'Pencegahan Credential Stuffing',
    relatedLessonId: '1-b'
  },
  {
    id: 'pd-03',
    mode: 'mode-a',
    difficulty: 'intermediate',
    title: 'Mitos Rotasi Sandi Rutin vs Kebiasaan Password Manager Modern',
    account: {
      name: 'Portal Belajar & Komputer Sekolah',
      type: 'Akun Akademik Siswa',
      initialConfig: 'Aturan sistem mewajibkan siswa mengganti kata sandi setiap 30 hari sekali.',
      alertOrDiscovery: 'Pengguna lelah mengingat sandi baru dan mulai membuat pola berurutan: BelajarJanuari26! lalu BelajarFebruari26!.'
    },
    evidence: [
      'Riset keamanan modern (seperti NIST SP 800-63B) menyatakan rotasi sandi paksa setiap bulan justru menurunkan keamanan karena manusia cenderung membuat pola tebakan yang rapuh.',
      'Tidak ada indikasi kebocoran atau akses mencurigakan pada akun Anda.'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Lanjutkan membuat variasi nama bulan berikutnya (BelajarMaret26!) agar mudah diingat.',
        safety: 'hazardous',
        score: 10,
        outcome: 'Pola musiman/nama bulan adalah salah satu pola pertama yang langsung ditebak oleh piranti lunak pembobol sandi.'
      },
      {
        id: 'opt-b',
        text: 'Tulis kata sandi baru setiap bulan di secarik kertas yang ditempel di layar monitor komputer lab.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Kredensial dapat dilihat langsung oleh siapa saja yang berada di ruangan (serangan shoulder surfing / physical breach).'
      },
      {
        id: 'opt-c',
        text: 'Gunakan Password Manager atau catat sandi unik acak di brankas digital terenkripsi, dan ubah sandi hanya jika ada indikasi kebocoran data.',
        safety: 'optimal',
        score: 100,
        outcome: 'Sangat sesuai dengan standar keamanan siber modern! Mengutamakan kualitas dan keunikan sandi daripada sekadar mengganti-ganti pola yang mudah diprediksi.'
      },
      {
        id: 'opt-d',
        text: 'Gunakan kata sandi pendek 6 huruf saja agar tidak repot saat diminta berganti tiap bulan.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Kata sandi 6 huruf dapat dibobol seketika tanpa perlu menebak pola.'
      }
    ],
    principle: 'Praktik keamanan terbaik tidak menuntut rotasi kata sandi berkala tanpa sebab. Standar NIST menganjurkan kata sandi panjang dan unik yang hanya diganti bila ada indikasi kompromi atau kebocoran data.',
    remediation: 'Fokuslah pada pembuatan kata sandi yang kuat dan unik sejak awal, simpan di pengelola sandi terenkripsi, dan aktifkan autentikasi multifaktor.',
    conceptKey: 'Standar Manajemen Sandi Modern (NIST)',
    relatedLessonId: '4-b'
  },

  // ── Mode B: Account Defense (3 scenarios) ───────────────────
  {
    id: 'pd-04',
    mode: 'mode-b',
    difficulty: 'intermediate',
    title: 'Evaluasi Autentikasi Multifaktor: SMS OTP vs Aplikasi Authenticator vs Passkey',
    account: {
      name: 'Penyimpanan Berkas Cloud Dokumen Penting',
      type: 'Layanan Cloud Storage',
      initialConfig: '2FA saat ini: Kode OTP via SMS ke nomor seluler.',
      alertOrDiscovery: 'Layanan cloud mengumumkan dukungan baru untuk Aplikasi Authenticator (TOTP) dan Passkey (FIDO2).'
    },
    evidence: [
      'SMS OTP rentan terhadap pembajakan nomor seluler (SIM swap), malware penyadap SMS (.apk), dan penipuan social engineering.',
      'Aplikasi Authenticator (seperti Google/Microsoft Authenticator) menghasilkan kode lokal tanpa melewati jaringan operator.',
      'Passkey berbasis kriptografi kunci publik yang terikat langsung ke domain resmi (phishing-resistant).'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Tetap gunakan SMS OTP saja karena paling praktis dan tidak perlu mengatur aplikasi lain.',
        safety: 'adequate',
        score: 40,
        outcome: 'Meskipun SMS OTP lebih baik daripada tidak ada 2FA sama sekali, metode ini masih bisa dicegat melalui teknik phishing relay atau malware Android pencuri SMS.'
      },
      {
        id: 'opt-b',
        text: 'Tingkatkan proteksi ke Aplikasi Authenticator (TOTP) atau daftarkan Passkey untuk perlindungan anti-phishing yang maksimal.',
        safety: 'optimal',
        score: 100,
        outcome: 'Pilihan pertahanan terbaik! Passkey dan TOTP melindungi akun Anda dari penyadapan jaringan seluler dan serangan reverse proxy phishing.'
      },
      {
        id: 'opt-c',
        text: 'Nonaktifkan 2FA sama sekali agar tidak repot saat login dari perangkat baru.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Sangat membahayakan akun! Tanpa 2FA, siapa pun yang mengetahui kata sandi Anda dapat langsung masuk tanpa hambatan.'
      },
      {
        id: 'opt-d',
        text: 'Kirimkan kode SMS ke ponsel teman agar ada cadangan verifikasi.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Membagikan saluran verifikasi ke orang lain merusak prinsip kerahasiaan identitas digital.'
      }
    ],
    principle: 'Autentikasi multifaktor (MFA) memiliki tingkatan keamanan: Passkey dan Hardware Key adalah yang paling tahan phishing, diikuti Aplikasi Authenticator (TOTP), sementara SMS OTP adalah metode paling rentan terhadap intersepsi.',
    remediation: 'Bila layanan mendukung, prioritaskan penggunaan Passkey atau Aplikasi Authenticator daripada SMS OTP untuk mengamankan akun-akun penting Anda.',
    conceptKey: 'Tingkatan Proteksi Autentikasi MFA',
    relatedLessonId: '4-a'
  },
  {
    id: 'pd-05',
    mode: 'mode-b',
    difficulty: 'intermediate',
    title: 'Manajemen Penyimpanan Kode Pemulihan Cadangan (Recovery Codes)',
    account: {
      name: 'Akun Pengembang & Komputasi Siswa',
      type: 'Layanan Platform Digital',
      initialConfig: '2FA Aplikasi Authenticator baru saja diaktifkan. Sistem menghasilkan 10 Kode Cadangan (Backup Codes).',
      alertOrDiscovery: 'Layar menampilkan 10 kode pemulihan sekali pakai: "Simpan kode ini di tempat yang aman jika perangkat Anda hilang."'
    },
    evidence: [
      'Kode pemulihan dapat digunakan untuk melewati 2FA jika ponsel rusak atau hilang.',
      'Banyak pengguna melakukan kesalahan dengan menyimpan tangkapan layar kode di galeri foto atau Google Drive tanpa enkripsi.'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Tangkap layar (screenshot) kode dan simpan di galeri foto ponsel tanpa pengaman.',
        safety: 'hazardous',
        score: 10,
        outcome: 'Berisiko! Aplikasi lain yang meminta izin akses galeri foto atau malware penyadap media dapat mencuri kode cadangan tersebut.'
      },
      {
        id: 'opt-b',
        text: 'Simpan kode di brankas Password Manager terenkripsi atau cetak/catat di kertas fisik dan simpan di brankas/tempat pribadi offline.',
        safety: 'optimal',
        score: 100,
        outcome: 'Strategi penyimpanan sempurna! Kode terlindungi enkripsi tingkat tinggi atau berada di dunia nyata (air-gapped) tanpa bisa diretas dari jarak jauh.'
      },
      {
        id: 'opt-c',
        text: 'Kirimkan daftar kode ke grup chat WhatsApp keluarga sebagai arsip.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Kode pemulihan terekspos ke semua anggota grup dan rentan jika ada salah satu ponsel keluarga yang hilang atau dibajak.'
      },
      {
        id: 'opt-d',
        text: 'Abaikan dan jangan simpan kode cadangan karena merasa ponsel tidak akan pernah hilang.',
        safety: 'hazardous',
        score: 20,
        outcome: 'Jika ponsel Anda rusak atau hilang di kemudian hari, Anda akan terkunci dari akun Anda secara permanen.'
      }
    ],
    principle: 'Kode pemulihan cadangan (recovery codes) memiliki kekuatan yang setara dengan kata sandi utama Anda. Harus disimpan di brankas digital terenkripsi atau salinan fisik offline yang terlindungi.',
    remediation: 'Perlakukan kode pemulihan darurat sebagai kunci brankas rahasia. Simpan di tempat yang aman dan terenkripsi, jangan di cloud publik tanpa proteksi.',
    conceptKey: 'Penyimpanan Kunci Pemulihan Cadangan',
    relatedLessonId: '1-a'
  },
  {
    id: 'pd-06',
    mode: 'mode-b',
    difficulty: 'intermediate',
    title: 'Audit Sesi Aktif & Perangkat Tepercaya (Session Management)',
    account: {
      name: 'Media Sosial & Akun Komunikasi',
      type: 'Akun Jejaring Sosial',
      initialConfig: 'Fitur "Perangkat yang Sedang Login" menampilkan 3 sesi aktif.',
      alertOrDiscovery: 'Saat membuka menu keamanan, Anda melihat sesi login asing: "Linux - Frankfurt, Jerman - Aktif 15 menit yang lalu".'
    },
    evidence: [
      'Sesi 1: iPhone 13 - Jakarta, Indonesia (Perangkat Anda saat ini, Aktif sekarang).',
      'Sesi 2: Windows PC - Surabaya, Indonesia (Laptop rumah Anda, Aktif kemarin).',
      'Sesi 3: Linux Browser - Frankfurt, Jerman (Tidak dikenal, Aktif 15 menit lalu).'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Biarkan saja karena mengira server media sosial memang berpusat di Jerman.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Peretas yang memiliki token sesi akun Anda tetap leluasa membaca pesan pribadi dan mengirim spam dari akun Anda.'
      },
      {
        id: 'opt-b',
        text: 'Segera tekan tombol "Cabut Sesi" (Log out) pada perangkat asing tersebut, lalu ganti kata sandi akun dan tinjau riwayat pesan.',
        safety: 'optimal',
        score: 100,
        outcome: 'Tindakan tepat dan tegas! Mencabut sesi mematikan token akses penyerang seketika, dan pergantian kata sandi mencegah penyerang login kembali.'
      },
      {
        id: 'opt-c',
        text: 'Hapus aplikasi media sosial dari ponsel Anda sendiri.',
        safety: 'hazardous',
        score: 10,
        outcome: 'Menghapus aplikasi di ponsel Anda tidak menghentikan sesi peretas yang aktif di server Jerman.'
      },
      {
        id: 'opt-d',
        text: 'Kirim pesan ke nomor peretas untuk menanyakan tujuan login.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Sesi asing adalah peretas atau bot otomatis; meladeni komunikasi tidak menutup celah keamanan akun Anda.'
      }
    ],
    principle: 'Pencurian token sesi (Session Hijacking) memungkinkan penyerang tetap login tanpa mengetahui kata sandi baru. Melakukan audit dan mencabut sesi login mencurigakan adalah tindakan wajib untuk memutus akses asing.',
    remediation: 'Rutin periksa menu "Perangkat & Sesi Aktif" di pengaturan akun Anda. Bila menemukan lokasi atau perangkat asing, segera putuskan koneksinya dan ubah kata sandi.',
    conceptKey: 'Audit Sesi & Manajemen Token Login',
    relatedLessonId: '4-a'
  },

  // ── Mode C: Breach Response (4 scenarios) ───────────────────
  {
    id: 'pd-07',
    mode: 'mode-c',
    difficulty: 'intermediate',
    title: 'Respons Insiden Kebocoran Kredensial Toko Daring',
    account: {
      name: 'Toko Buku Online & Email Sekolah',
      type: 'Akun Belanja & Email Terhubung',
      initialConfig: 'Kata sandi akun toko buku sama dengan kata sandi akun email sekolah.',
      alertOrDiscovery: 'Toko buku online mengumumkan insiden kebocoran database 500.000 akun pelanggan.'
    },
    evidence: [
      'Email pemberitahuan resmi menyarankan pelanggan mengganti kata sandi.',
      'Banyak pihak ketiga jahat memanfaatkan momen ini untuk mengirim email phishing tiruan yang berisi link reset palsu.'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Klik tautan "Reset Sekarang" yang ada di dalam badan email pemberitahuan tanpa mengecek pengirim.',
        safety: 'hazardous',
        score: 10,
        outcome: 'Berisiko terjebak phishing susulan! Penipu kerap mengirim email palsu berkedok instruksi pemulihan kebocoran.'
      },
      {
        id: 'opt-b',
        text: 'Buka browser, ketik alamat resmi toko buku secara mandiri untuk mengganti sandi, dan segera ganti kata sandi email sekolah dengan sandi baru yang berbeda.',
        safety: 'optimal',
        score: 100,
        outcome: 'Urutan respons insiden yang sempurna! Mengakses portal resmi secara mandiri mencegah phishing, dan mengganti sandi email memutus risiko credential stuffing.'
      },
      {
        id: 'opt-c',
        text: 'Abaikan karena Anda jarang berbelanja lagi di toko buku tersebut.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Fatal! Penyerang akan menggunakan kredensial toko buku yang bocor untuk membobol email sekolah Anda yang menggunakan sandi kembar.'
      },
      {
        id: 'opt-d',
        text: 'Ganti alamat email toko buku menjadi email teman Anda.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Tindakan ini tidak menyelesaikan masalah kebocoran sandi lama Anda dan malah melibatkan pihak lain.'
      }
    ],
    principle: 'Saat menghadapi laporan kebocoran data, selalu kunjungi situs resmi secara langsung (out-of-band), ganti kata sandi akun yang terdampak, dan yang paling krusial: ganti akun lain yang pernah memakai sandi serupa.',
    remediation: 'Terapkan prosedur penanganan insiden: jangan klik tautan di email pemberitahuan, kunjungi situs resmi secara langsung, dan perbarui semua akun yang berbagi kredensial.',
    conceptKey: 'Prosedur Penanganan Insiden Kebocoran Data',
    relatedLessonId: '1-b'
  },
  {
    id: 'pd-08',
    mode: 'mode-c',
    difficulty: 'intermediate',
    title: 'Serangan Notifikasi Persetujuan Bertubi-tubi (MFA Fatigue / Bombing)',
    account: {
      name: 'Akun Komputasi & Portal Akademik',
      type: 'Akun Institusi dengan 2FA Push Notification',
      initialConfig: 'Kata sandi telah diketahui penyerang; 2FA menggunakan notifikasi push "Ya/Tidak".',
      alertOrDiscovery: 'Pukul 02.15 dini hari ponsel Anda menerima 40 permintaan persetujuan login berturut-turut: "Apakah ini Anda yang masuk? Tekan YA untuk setuju".'
    },
    evidence: [
      'Penyerang sudah memegang kata sandi akun Anda dan sengaja membanjiri notifikasi tengah malam agar korban terganggu, frustrasi, atau tidak sengaja menekan "Ya".',
      'Teknik ini dikenal sebagai MFA Fatigue (MFA Bombing / Prompt Spamming).'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Tekan tombol "Ya, Izinkan" agar notifikasi yang mengganggu tersebut berhenti berdering.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Akun langsung jebol! Penyerang berhasil masuk ke sistem begitu Anda memberikan persetujuan.'
      },
      {
        id: 'opt-b',
        text: 'Tolak (Deny) permintaan, jangan pernah menyetujui, dan segera buka perangkat resmi untuk mengganti kata sandi akun serta laporkan ke admin IT.',
        safety: 'optimal',
        score: 100,
        outcome: 'Keputusan tangguh dan waspada! Menolak permintaan menahan penyerang di luar, dan mengganti kata sandi menghentikan serangan spam MFA seketika.'
      },
      {
        id: 'opt-c',
        text: 'Matikan ponsel tanpa mengubah kata sandi dan tidur kembali.',
        safety: 'adequate',
        score: 40,
        outcome: 'Notifikasi memang berhenti di malam hari, tetapi penyerang masih memegang kata sandi Anda dan akan mencoba kembali esok hari.'
      },
      {
        id: 'opt-d',
        text: 'Nonaktifkan fitur 2FA pada akun Anda dari komputer sekolah esok pagi.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Menonaktifkan 2FA saat kata sandi sudah bocor sama saja dengan menyerahkan akun sepenuhnya kepada peretas.'
      }
    ],
    principle: 'Serangan MFA Fatigue mengeksploitasi kelelahan psikologis manusia. Jangan pernah menyetujui prompt login yang tidak Anda inisiasi sendiri. Kehadiran prompt tak dikenal adalah bukti nyata bahwa kata sandi Anda telah kompromi.',
    remediation: 'Tolak prompt autentikasi yang mencurigakan, segera ganti kata sandi akun Anda untuk memutus serangan, dan gunakan metode MFA pencocokan angka (number matching) jika tersedia.',
    conceptKey: 'Pertahanan Terhadap Serangan MFA Fatigue',
    relatedLessonId: '4-a'
  },
  {
    id: 'pd-09',
    mode: 'mode-c',
    difficulty: 'intermediate',
    title: 'Verifikasi Notifikasi Keamanan: Alarm Palsu vs Upaya Pembobolan',
    account: {
      name: 'Akun Surel Siswa',
      type: 'Surel Pendidikan',
      initialConfig: '2FA aktif; menerima email peringatan sistem login baru.',
      alertOrDiscovery: 'Anda menerima email: "Login baru terdeteksi: Chrome di Windows 11, IP 180.252.xx.xx (Indonesia), Pukul 10.12 WIB".'
    },
    evidence: [
      'Pada pukul 10.10 WIB (2 menit sebelum email), Anda memang baru saja menyalakan laptop di laboratorium komputer sekolah dan login ke email tersebut.',
      'Perangkat, jam, dan penyedia jaringan sesuai dengan aktivitas nyata yang baru saja Anda lakukan.'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Panik dan langsung memformat ulang hard drive laptop sekolah.',
        safety: 'hazardous',
        score: 10,
        outcome: 'Tindakan destruktif yang tidak proporsional! Notifikasi tersebut adalah laporan sistem wajar atas aktivitas login Anda sendiri.'
      },
      {
        id: 'opt-b',
        text: 'Verifikasi kecocokan waktu, perangkat, dan lokasi dengan aktivitas Anda; sadari bahwa ini adalah login sah Anda, dan tandai "Ya, ini saya" jika sistem meminta konfirmasi.',
        safety: 'optimal',
        score: 100,
        outcome: 'Analisis rasional yang cermat! Mengonfirmasi aktivitas sah membantu sistem kecerdasan keamanan membedakan kebiasaan normal Anda dari serangan nyata.'
      },
      {
        id: 'opt-c',
        text: 'Segera matikan fitur notifikasi keamanan email agar tidak ada lagi email pemberitahuan login masuk.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Menonaktifkan notifikasi keamanan membuat Anda buta terhadap ancaman nyata jika ada peretas yang masuk di kemudian hari.'
      },
      {
        id: 'opt-d',
        text: 'Kirim email protes ke administrator IT menuduh mereka membajak akun Anda.',
        safety: 'adequate',
        score: 30,
        outcome: 'Salah paham yang membuang waktu karena sistem keamanan hanya menjalankan tugas pelaporan otomatis.'
      }
    ],
    principle: 'Keamanan siber yang efektif didasarkan pada ketelitian memeriksa konteks (waktu, perangkat, dan IP), bukan kepanikan buta. Notifikasi keamanan adalah instrumen pengawas yang penting untuk diverifikasi secara tenang.',
    remediation: 'Bandingkan detail notifikasi dengan riwayat aktivitas pribadi Anda. Bila cocok, konfirmasikan keabsahannya; bila ada ketidakcocokan waktu atau lokasi, barulah ambil tindakan mitigasi darurat.',
    conceptKey: 'Pemeriksaan Konteks & Verifikasi Notifikasi',
    relatedLessonId: '2-e'
  },
  {
    id: 'pd-10',
    mode: 'mode-c',
    difficulty: 'intermediate',
    title: 'Mitigasi Insiden: Kode Pemulihan Cadangan Terekspos ke Publik',
    account: {
      name: 'Akun Penyimpanan Cloud & Portofolio',
      type: 'Layanan Berkas Digital',
      initialConfig: '2FA aktif; 10 Recovery Codes disimpan dalam berkas catatan teks.',
      alertOrDiscovery: 'Anda tidak sengaja mengunggah tangkapan layar layar komputer ke media sosial yang memperlihatkan berkas terbuka berisi 10 kode pemulihan cadangan akun Anda.'
    },
    evidence: [
      'Postingan foto dilihat oleh puluhan orang selama 20 menit sebelum berhasil dihapus.',
      'Seseorang mungkin telah menyimpan atau mencatat kode-kode pemulihan darurat tersebut.'
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Cukup hapus postingan media sosial dan merasa aman karena foto sudah tidak terlihat publik.',
        safety: 'hazardous',
        score: 10,
        outcome: 'Sangat berisiko! Gambar yang sempat beredar di internet bisa saja sudah diunduh atau disimpan dalam cache oleh pihak lain.'
      },
      {
        id: 'opt-b',
        text: 'Segera masuk ke pengaturan 2FA di situs resmi, pilih "Regenerasi / Buat Ulang Kode Cadangan" (Revoke & Regenerate) agar kode yang terekspos langsung hangus.',
        safety: 'optimal',
        score: 100,
        outcome: 'Langkah mitigasi yang tepat dan efektif! Menghasilkan set kode baru secara otomatis membatalkan seluruh kode lama yang sempat bocor, memulihkan integritas akun secara instan.'
      },
      {
        id: 'opt-c',
        text: 'Ganti nama tampilan akun media sosial Anda agar orang tidak mengenali pemilik foto.',
        safety: 'hazardous',
        score: 0,
        outcome: 'Mengganti nama profil tidak membatalkan keabsahan kode pemulihan yang masih aktif di server cloud.'
      },
      {
        id: 'opt-d',
        text: 'Hapus seluruh file yang tersimpan di cloud storage Anda.',
        safety: 'hazardous',
        score: 10,
        outcome: 'Merugikan diri sendiri karena kehilangan data berharga, padahal masalahnya cukup diselesaikan dengan meregenerasi kode pemulihan.'
      }
    ],
    principle: 'Prinsip Keamanan Revokasi Kredensial: Ketika kunci rahasia atau kode pemulihan akun terindikasi kompromi, tindakan tercepat dan teraman adalah membatalkan (revoke) kode lama dan menerbitkan kode keamanan baru dari portal resmi.',
    remediation: 'Bila ada kredensial atau kode cadangan yang bocor, jangan hanya menghapus jejak publiknya; segera masuk ke pengaturan keamanan resmi dan batalkan kredensial lama dengan meregenerasi kode baru.',
    conceptKey: 'Revokasi & Regenerasi Kode Keamanan',
    relatedLessonId: '4-a'
  }
];
