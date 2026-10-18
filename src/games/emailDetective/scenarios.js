// src/games/emailDetective/scenarios.js
// 10 Curated Fictional Scenarios for Email Detective Simulation
// All scenarios, identities, and domains are entirely fictional and safe for educational training.
// Real external links are NEVER used; all simulated destinations are inert.

export const EMAIL_SCENARIOS = [
  {
    id: 'ed-01',
    classification: 'phishing', // 'legitimate' | 'suspicious' | 'phishing'
    senderName: 'Bank Contoh Nasional — Keamanan Akun',
    senderEmail: 'alert-keamanan@bankcontoh-verifikasi.example.org',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '18 Okt 2026, 08:30 WIB',
    subject: '🚨 PERINGATAN DARURAT: Rekening Anda Akan Diblokir dalam 24 Jam!',
    bodyHtml: `
      <p>Yth. Nasabah Bank Contoh Nasional,</p>
      <p>Sistem kami mendeteksi aktivitas mencurigakan berupa upaya login berulang kali dari alamat IP asing (Moskow, Rusia) pada akun perbankan digital Anda dini hari tadi.</p>
      <p>Demi keselamatan dana Anda, akun saat ini dibatasi sementara. <strong>Jika Anda tidak melakukan verifikasi ulang dalam batas waktu 24 jam, rekening Anda akan diblokir total secara permanen.</strong></p>
      <p>Silakan klik tautan di bawah ini untuk memperbarui kata sandi dan memasukkan kode OTP verifikasi Anda segera:</p>
      <p style="margin: 20px 0;">
        <span class="simulated-link-trigger" data-link-idx="0">👉 Verifikasi dan Buka Blokir Akun Sekarang</span>
      </p>
      <p>Hormat kami,<br><strong>Divisi Perlindungan Siber Bank Contoh Nasional</strong></p>
    `,
    links: [
      {
        text: '👉 Verifikasi dan Buka Blokir Akun Sekarang',
        displayedUrl: 'https://bankcontoh-nasional.example.id/verifikasi-keamanan',
        actualDestination: 'http://login-bcn-update.example.net/auth?token=8291f9',
        isSuspicious: true,
        explanation: 'Tautan mengarah ke domain tidak dikenal (example.net) menggunakan protokol HTTP tanpa enkripsi, bukan situs resmi bank.'
      }
    ],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Domain pengirim bukan domain resmi bank (menggunakan "bankcontoh-verifikasi.example.org")',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Menggunakan taktik kepanikan dan batas waktu darurat 24 jam agar korban terburu-buru',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Tautan verifikasi mengarah ke alamat palsu dan tidak aman (HTTP)',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Meminta konfirmasi kata sandi dan kode OTP melalui tautan email',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Email ini adalah serangan phishing klasik berbasis ancaman mendesak (*fear & urgency*). Penipu menggunakan domain tiruan untuk memancing korban memasukkan kata sandi dan OTP ke situs penipu.',
    warningSigns: [
      'Alamat pengirim tidak resmi',
      'Desakan waktu 24 jam dengan ancaman pemblokiran permanen',
      'Tautan tujuan berbeda jauh dari teks yang ditampilkan',
      'Bank resmi tidak pernah meminta kata sandi atau OTP lewat tautan email'
    ],
    recommendation: 'Jangan pernah klik tautan pada email peringatan akun bank. Buka aplikasi resmi mobile banking secara mandiri atau hubungi call center resmi bank.',
    relatedLessonId: '2-b'
  },
  {
    id: 'ed-02',
    classification: 'legitimate',
    senderName: 'Bagian Akademik SMP Contoh Andalan',
    senderEmail: 'akademik@smpcontoh.example.sch.id',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '17 Okt 2026, 14:15 WIB',
    subject: 'Jadwal dan Panduan Pelaksanaan Penilaian Akhir Semester (PAS) Ganjil',
    bodyHtml: `
      <p>Yth. Seluruh Siswa Kelas 9 SMP Contoh Andalan,</p>
      <p>Sehubungan dengan berakhirnya masa pembelajaran semester ganjil tahun ajaran 2026/2027, bersama ini kami sampaikan jadwal resmi dan tata tertib Penilaian Akhir Semester (PAS).</p>
      <p>Jadwal lengkap serta kisi-kisi pelajaran telah diunggah pada portal resmi sekolah. Siswa dapat melihat jadwal tersebut dengan masuk ke portal siswa masing-masing seperti biasa, atau melihat papan pengumuman di sekolah.</p>
      <p style="margin: 20px 0;">
        <span class="simulated-link-trigger" data-link-idx="0">📄 Unduh Surat Edaran Jadwal PAS (PDF)</span>
      </p>
      <p>Harap mempersiapkan diri dengan baik dan menjaga kesehatan.</p>
      <p>Salam hangat,<br><strong>Tim Kurikulum & Akademik SMP Contoh Andalan</strong></p>
    `,
    links: [
      {
        text: '📄 Unduh Surat Edaran Jadwal PAS (PDF)',
        displayedUrl: 'https://portal.smpcontoh.example.sch.id/dokumen/jadwal-pas-2026.pdf',
        actualDestination: 'https://portal.smpcontoh.example.sch.id/dokumen/jadwal-pas-2026.pdf',
        isSuspicious: false,
        explanation: 'Tautan tujuan sama persis dengan alamat yang ditampilkan dan berada di subdomain resmi sekolah (.sch.id) dengan enkripsi HTTPS.'
      }
    ],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Email dikirim dari domain resmi lembaga pendidikan sekolah (.example.sch.id)',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Tautan mengarah tepat ke portal resmi sekolah dengan sertifikat HTTPS yang valid',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Pesan bersifat informatif tanpa meminta kata sandi, OTP, atau data rahasia',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Tidak ada paksaan mendesak atau ancaman sanksi tidak wajar',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Email ini sah dan aman (*legitimate*). Pengirim menggunakan domain resmi sekolah, tujuan tautan transparan dan terenkripsi, serta isinya murni pengumuman akademik tanpa meminta tindakan berisiko.',
    warningSigns: [
      'Tidak ada tanda bahaya',
      'Domain pengirim dan tujuan URL konsisten',
      'Bahasa resmi dan wajar untuk lingkungan sekolah'
    ],
    recommendation: 'Email resmi sekolah seperti ini aman untuk dibaca dan tautan resmi portal sekolah dapat diakses tanpa kekhawatiran.',
    relatedLessonId: '1-b'
  },
  {
    id: 'ed-03',
    classification: 'phishing',
    senderName: 'Promo Meriah Belanja Ceria',
    senderEmail: 'klaim-kupon-5jt@hadiah-toko-promo.example.net',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '17 Okt 2026, 11:40 WIB',
    subject: '🎉 SELAMAT! Anda Terpilih Menang Saldo Belanja Rp 5.000.000!',
    bodyHtml: `
      <p>Hai Kakak Beruntung!</p>
      <p>Selamat ya! Nomor email Anda terpilih secara acak dalam program <em>Gebyar Apresiasi Pelanggan Nusantara 2026</em> untuk mendapatkan <strong>Saldo Belanja Gratis senilai Rp 5.000.000,-</strong> tanpa diundi!</p>
      <p>Klaim sekarang sebelum kuota hangus dalam 2 jam ke depan. Untuk proses verifikasi pencairan saldo, silakan isi data KTP, foto kartu pelajar, dan nomor kartu ATM Anda pada formulir klaim di bawah ini:</p>
      <p style="margin: 20px 0;">
        <span class="simulated-link-trigger" data-link-idx="0">🎁 Ambil Hadiah Saldo Rp 5 Juta Sekarang</span>
      </p>
      <p>Jangan sia-siakan kesempatan emas ini!</p>
      <p>Salam,<br><strong>Panitia Gebyar Belanja Nusantara</strong></p>
    `,
    links: [
      {
        text: '🎁 Ambil Hadiah Saldo Rp 5 Juta Sekarang',
        displayedUrl: 'https://toko-resmi.example.com/klaim-hadiah',
        actualDestination: 'https://klaim-dana-gratis-2026.example.org/form-data-pribadi',
        isSuspicious: true,
        explanation: 'Tautan mengarah ke situs penampung formulir palsu yang bertujuan mencuri nomor identitas dan data perbankan.'
      }
    ],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Janji hadiah uang tunai bernilai fantastis tanpa pernah mendaftar undian apapun (too good to be true)',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Meminta data sensitif berisiko tinggi seperti foto KTP/kartu pelajar dan nomor kartu perbankan',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Tautan tujuan berbeda dari URL yang tertulis di teks pesan',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Domain pengirim anonim dan mencurigakan (.example.net)',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Ini adalah penipuan phishing berkedok undian palsu (*lottery/giveaway scam*). Tujuannya adalah pencurian identitas (*identity theft*) dan pembajakan rekening perbankan melalui data kartu yang diminta.',
    warningSigns: [
      'Kemenangan tiba-tiba tanpa pernah mengikuti undian',
      'Permintaan data pribadi sensitif (KTP, kartu ATM)',
      'Trik desakan waktu 2 jam untuk mencegah korban berpikir kritis',
      'Alamat pengirim tidak jelas reputasinya'
    ],
    recommendation: 'Abaikan dan tandai sebagai spam/phishing. Tidak ada pihak terpercaya yang memberikan jutaan rupiah secara cuma-cuma dan meminta data perbankan rahasia.',
    relatedLessonId: '2-b'
  },
  {
    id: 'ed-04',
    classification: 'suspicious',
    senderName: 'Layanan Akun Game Contoh',
    senderEmail: 'support@gamecontoh.example.com',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '16 Okt 2026, 20:10 WIB',
    subject: 'Pemberitahuan: Permintaan Perubahan Alamat Email Akun Game Anda',
    bodyHtml: `
      <p>Halo Petualang Game Contoh,</p>
      <p>Kami menerima permohonan pergantian alamat email akun utama Anda ke alamat email baru: <code>pembajak99@anon-mail.example.org</code> pada pukul 19:55 WIB.</p>
      <p>Jika Anda yang mengajukan permohonan ini, silakan masukkan kode konfirmasi yang telah dikirimkan ke email baru Anda.</p>
      <p><strong>Namun, jika Anda MERASA TIDAK PERNAH meminta pergantian ini</strong>, seseorang kemungkinan memiliki akses ke akun Anda. Segera amankan akun Anda melalui tautan pengaturan keamanan resmi di bawah ini:</p>
      <p style="margin: 20px 0;">
        <span class="simulated-link-trigger" data-link-idx="0">🛡️ Buka Halaman Pengaturan Keamanan Akun</span>
      </p>
      <p>Tim Game Contoh tidak akan pernah menanyakan kata sandi Anda.</p>
    `,
    links: [
      {
        text: '🛡️ Buka Halaman Pengaturan Keamanan Akun',
        displayedUrl: 'https://gamecontoh.example.com/account/security',
        actualDestination: 'https://gamecontoh.example.com/account/security',
        isSuspicious: false,
        explanation: 'Tautan mengarah tepat ke situs resmi penyedia game dengan enkripsi HTTPS.'
      }
    ],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Email notifikasi berasal dari domain resmi pengembang game (@gamecontoh.example.com)',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Ada aktivitas mencurigakan yang tidak dilakukan oleh pemilik akun (upaya pengambilalihan akun)',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Tautan dalam email mengarah ke halaman keamanan resmi dan tidak meminta password di email',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Situasi menunjukkan ancaman terhadap akun meskipun email notifikasinya asli',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Email notifikasi ini sah (*authentic*), tetapi situasi akun Anda **mencurigakan / bahaya (*suspicious*)** karena ada pihak ketiga yang berusaha membajak akun Anda. Pengguna harus segera bertindak mandiri mengamankan akun.',
    warningSigns: [
      'Aktivitas perubahan email yang tidak pernah Anda lakukan',
      'Indikasi pembajakan kredensial akun oleh pihak lain',
      'Email pemberitahuan resmi tetapi menuntut tindakan pengamanan segera'
    ],
    recommendation: 'Jangan panik. Segera buka aplikasi game atau situs resmi game secara langsung, ganti kata sandi dengan kombinasi yang kuat, dan aktifkan Autentikasi Dua Faktor (2FA).',
    relatedLessonId: '4-a'
  },
  {
    id: 'ed-05',
    classification: 'phishing',
    senderName: 'PT Cepat Logistik Kurir',
    senderEmail: 'admin-faktur@pengiriman-paket-cepat.example.org',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '16 Okt 2026, 09:05 WIB',
    subject: 'Dokumen Tagihan Faktur Paket #TRX-99214 [Lampiran]',
    bodyHtml: `
      <p>Kepada Pelanggan Yang Terhormat,</p>
      <p>Paket kiriman Anda dengan nomor resi #TRX-99214 saat ini tertahan di gudang logistik kami karena adanya biaya bea masuk/ongkir tambahan yang belum terselesaikan.</p>
      <p>Rincian lengkap dan instruksi pembayaran telah kami lampirkan dalam dokumen berkas terlampir. Mohon unduh dan buka berkas tersebut di komputer Anda untuk melihat invoice resmi.</p>
      <p>Jika pembayaran tidak dilunasi sebelum pukul 17:00 WIB, paket akan dikembalikan ke pengirim.</p>
      <p>Terima kasih atas kerja samanya.<br><strong>Layanan Pelanggan Cepat Logistik</strong></p>
    `,
    links: [],
    attachments: {
      fileName: 'Rincian_Faktur_Tagihan_Resi99214.pdf.exe',
      fileSize: '748 KB',
      isDangerous: true,
      fileTypeNote: 'Berkas aplikasi executable (.exe) yang menyamar sebagai dokumen PDF!'
    },
    clues: [
      {
        id: 'c1',
        text: 'Lampiran memiliki ekstensi ganda berbahaya: ".pdf.exe" yang menandakan berkas program/malware',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Penerima tidak pernah merasa memesan paket dengan nomor resi tersebut',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Nama domain pengirim generik dan tidak terafiliasi dengan ekspedisi resmi terdaftar',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Menggunakan taktik ancaman paket dikembalikan/hangus hari ini',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Email ini adalah serangan phishing bermuatan malware (*malware attachment phishing*). Berkas lampiran berakhiran `.exe` adalah program berbahaya (seperti Trojan atau Ransomware) yang menyamar dengan ikon PDF untuk mengelabui korban.',
    warningSigns: [
      'Ekstensi ganda pada lampiran (.pdf.exe)',
      'Tidak ada riwayat pemesanan paket yang cocok',
      'Desakan waktu pelunasan biaya tak dikenal',
      'Pengirim menggunakan domain tidak resmi'
    ],
    recommendation: 'Jangan pernah mengunduh atau membuka berkas berekstensi .exe, .scr, atau .zip dari pengirim tak dikenal. Hapus email ini segera.',
    relatedLessonId: '3-b'
  },
  {
    id: 'ed-06',
    classification: 'legitimate',
    senderName: 'Layanan Streaming Irama Musik',
    senderEmail: 'info@iramamusik.example.com',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '15 Okt 2026, 16:30 WIB',
    subject: 'Pembaruan Syarat Layanan dan Kebijakan Privasi Irama Musik',
    bodyHtml: `
      <p>Halo Fardhan,</p>
      <p>Sebagai bagian dari komitmen kami terhadap transparansi dan perlindungan privasi data pengguna, kami memperbarui <strong>Ketentuan Layanan dan Kebijakan Privasi</strong> kami yang mulai berlaku pada 1 November 2026.</p>
      <p>Pembaruan ini menjelaskan bagaimana kami mengelola data preferensi lagu Anda, memberikan opsi kendali riwayat pemutaran, serta menyelaraskan kebijakan dengan regulasi perlindungan data pribadi terbaru.</p>
      <p><strong>Tidak ada tindakan wajib yang perlu Anda lakukan.</strong> Jika Anda terus menggunakan layanan kami setelah tanggal tersebut, Anda menyetujui pembaruan ini.</p>
      <p style="margin: 20px 0;">
        <span class="simulated-link-trigger" data-link-idx="0">📖 Baca Kebijakan Privasi Lengkap</span>
      </p>
      <p>Terima kasih telah mendengarkan bersama Irama Musik!</p>
    `,
    links: [
      {
        text: '📖 Baca Kebijakan Privasi Lengkap',
        displayedUrl: 'https://iramamusik.example.com/kebijakan-privasi',
        actualDestination: 'https://iramamusik.example.com/kebijakan-privasi',
        isSuspicious: false,
        explanation: 'Tautan mengarah tepat ke halaman dokumentasi resmi di domain utama iramamusik.example.com melalui HTTPS.'
      }
    ],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Email dikirim dari domain resmi layanan musik yang terdaftar (@iramamusik.example.com)',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Secara eksplisit menyebutkan "Tidak ada tindakan wajib yang perlu Anda lakukan"',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Tautan murni menuju halaman dokumentasi kebijakan resmi, bukan formulir login',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Tidak ada permintaan data pribadi, pembayaran, atau kredensial akun',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Email ini sah (*legitimate*). Ini adalah notifikasi rutin pembaruan regulasi privasi yang biasa dikirimkan oleh penyedia layanan digital resmi tanpa meminta tindakan berisiko.',
    warningSigns: [
      'Tidak ada tanda bahaya',
      'Pesan transparan dan tidak menuntut input data',
      'Domain pengirim valid dan terpercaya'
    ],
    recommendation: 'Email ini aman. Anda dapat membaca kebijakannya jika ingin memahami hak perlindungan data Anda di layanan tersebut.',
    relatedLessonId: '2-a'
  },
  {
    id: 'ed-07',
    classification: 'phishing',
    senderName: 'Bambang Sudirman (Guru Komputer Sekolah)',
    senderEmail: 'guru.bambang.sekolah@layanan-mail-publik.example.com',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '15 Okt 2026, 13:00 WIB',
    subject: 'MOHON BANTUAN CEPAT: Beli Voucher Play Store untuk Lomba Hari Ini',
    bodyHtml: `
      <p>Halo Fardhan,</p>
      <p>Bapak sedang berada di luar sekolah menghadiri rapat dinas mendesak dengan pengawas dan tidak bisa menerima panggilan telepon.</p>
      <p>Bapak butuh bantuan darurat kamu siang ini untuk membelikan 4 lembar kartu voucher Google Play Store pecahan 250rb di minimarket terdekat untuk hadiah lomba tim sekolah kita.</p>
      <p>Tolong fotokan kode vouchernya dan balas email ini secepatnya ya. Nanti sore sepulang dari rapat, uangnya langsung Bapak ganti tunai secara penuh di ruang guru. Ini sangat penting, mohon bantuannya segera!</p>
      <p>Terima kasih banyak,<br><strong>Bambang Sudirman, S.Kom</strong></p>
    `,
    links: [],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Pengirim mengaku sebagai guru tetapi menggunakan email pribadi/publik antah-berantah, bukan email resmi sekolah',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Permintaan pembelian voucher / transfer uang yang sangat tidak lazim dari seorang guru kepada siswa',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Membuat alasan tidak bisa dihubungi lewat telepon untuk menghindari verifikasi suara',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Menciptakan tekanan emosional mendesak dengan dalih lomba sekolah',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Ini adalah penipuan rekayasa sosial berkedok peniruan identitas guru (*impersonation / CEO fraud*). Penipu berpura-pura menjadi figur otoritas untuk memeras uang atau kode voucher digital dari korban.',
    warningSigns: [
      'Alamat email guru tidak cocok dengan alamat dinas sekolah',
      'Permintaan pembelian voucher/uang melalui email pribadi',
      'Alasan "sedang rapat tidak bisa ditelepon" untuk membatasi komunikasi'
    ],
    recommendation: 'Jangan pernah membelikan voucher atau mengirim uang. Segera konfirmasi langsung ke sekolah atau temui guru yang bersangkutan secara tatap muka.',
    relatedLessonId: '2-b'
  },
  {
    id: 'ed-08',
    classification: 'suspicious',
    senderName: 'Pusat Keamanan Media Sosial',
    senderEmail: 'security-noreply@sosmed-resmi.example.com',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '14 Okt 2026, 23:45 WIB',
    subject: 'Kode Verifikasi Reset Kata Sandi Anda: 829-104',
    bodyHtml: `
      <p>Halo,</p>
      <p>Kami menerima permohonan untuk menyetel ulang kata sandi akun Media Sosial Anda.</p>
      <p>Gunakan kode verifikasi berikut untuk melanjutkan proses di aplikasi:</p>
      <div style="margin: 15px 0; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #f08065;">
        829-104
      </div>
      <p>Kode ini hanya berlaku selama 10 menit. <strong>Jangan pernah membagikan kode ini kepada siapa pun, termasuk staf kami.</strong></p>
      <p><em>Jika Anda TIDAK MERASA meminta reset kata sandi</em>, abaikan pesan ini. Akun Anda tetap aman selama tidak ada yang mengetahui kode verifikasi di atas.</p>
    `,
    links: [],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Email berasal dari domain resmi penyedia media sosial (@sosmed-resmi.example.com)',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Ada pihak lain yang mengetahui email Anda dan mencoba menyetel ulang kata sandi akun Anda',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Secara eksplisit mengingatkan agar kode tidak pernah diberikan kepada siapa pun',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Tidak ada tautan jebakan di dalam email',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Email ini asli dari sistem media sosial, tetapi peristiwa ini tergolong **mencurigakan (*suspicious*)** karena mengindikasikan ada seseorang yang mencoba membobol atau mereset akun Anda tanpa izin.',
    warningSigns: [
      'Menerima kode verifikasi tanpa pernah memintanya',
      'Indikasi akun Anda sedang menjadi sasaran upaya login paksa',
      'Tanda perlunya memperkuat keamanan akun'
    ],
    recommendation: 'Jangan pernah berikan kode verifikasi tersebut kepada siapa pun! Segera buka aplikasi resmi dan pastikan kata sandi Anda kuat serta fitur 2FA tetap aktif.',
    relatedLessonId: '4-a'
  },
  {
    id: 'ed-09',
    classification: 'phishing',
    senderName: 'Pusat Berkas Cloud',
    senderEmail: 'share-dokumen@drlve-googIe.example.org',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '14 Okt 2026, 17:20 WIB',
    subject: 'Teman Anda membagikan berkas: "Bocoran_Soal_Ujian_Akhir_2026.docx"',
    bodyHtml: `
      <p>Halo Fardhan,</p>
      <p>Seorang pengguna telah membagikan dokumen privat dengan Anda di Google Drive:</p>
      <div style="background: rgba(0,0,0,0.04); padding: 12px; border-left: 4px solid #61CDA8; margin: 15px 0;">
        <strong>📄 Bocoran_Soal_Ujian_Akhir_2026.docx</strong><br>
        <small style="color: #666;">Ukuran: 1.2 MB • Akses Terbatas</small>
      </div>
      <p>Untuk membuka dan membaca dokumen terenkripsi ini, Anda diwajibkan masuk (*login*) menggunakan email dan kata sandi akun Google Anda terlebih dahulu pada formulir penampil dokumen:</p>
      <p style="margin: 20px 0;">
        <span class="simulated-link-trigger" data-link-idx="0">📂 Buka Dokumen di Google Drive Cloud</span>
      </p>
      <p>Tautan akan kedaluwarsa dalam 12 jam.</p>
    `,
    links: [
      {
        text: '📂 Buka Dokumen di Google Drive Cloud',
        displayedUrl: 'https://drive.google.com/file/d/928104xksd/view',
        actualDestination: 'http://login-drive-googIe-auth.example.net/viewer',
        isSuspicious: true,
        explanation: 'Alamat tujuan menggunakan domain typosquatting palsu (huruf I besar menyerupai huruf l kecil) dan tidak menggunakan protokol aman HTTPS.'
      }
    ],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Domain pengirim menggunakan typosquatting (drlve-googIe menggunakan huruf I besar sebagai pengganti huruf l)',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Tautan asli mengarah ke server jebakan di example.net melalui HTTP, bukan drive.google.com',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Menggunakan umpan dokumen sensasional "Bocoran Soal Ujian" untuk memancing rasa penasaran',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Mengharuskan input kata sandi akun untuk melihat dokumen yang dibagikan',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Ini adalah phishing pencurian kredensial (*credential harvesting*) dengan teknik penipuan nama domain serupa (*typosquatting*). Tujuannya adalah merampas kata sandi akun Google korban saat mencoba membuka berkas palsu tersebut.',
    warningSigns: [
      'Ejaan domain pengirim salah ketik yang disengaja (typosquatting)',
      'Tautan tujuan palsu tanpa enkripsi',
      'Umpan berkas mencurigakan yang meminta input kata sandi'
    ],
    recommendation: 'Waspada terhadap tautan berkas mencurigakan. Jangan pernah memasukkan kata sandi akun Anda pada halaman web yang dibuka dari tautan email yang tidak jelas.',
    relatedLessonId: '2-b'
  },
  {
    id: 'ed-10',
    classification: 'legitimate',
    senderName: 'CyberWise Learning Platform',
    senderEmail: 'belajar@cyberwise.example.edu',
    recipientEmail: 'fardhan@sekolah.example.id',
    date: '13 Okt 2026, 10:00 WIB',
    subject: 'Ringkasan Belajar Mingguan: Hebat! Anda Menyelesaikan 3 Materi Baru',
    bodyHtml: `
      <p>Halo Pelajar Tangguh,</p>
      <p>Kerja bagus! Dalam seminggu terakhir Anda telah aktif mempelajari kurikulum keamanan siber di CyberWise. Berikut rangkuman kemajuan Anda:</p>
      <ul>
        <li>✅ <strong>3 Materi Selesai</strong>: Bab 1-a, 1-b, dan 1-c</li>
        <li>🏆 <strong>Skor Kuis Rata-rata</strong>: 90% pada Kuis Pemahaman Bab 1</li>
        <li>📝 <strong>1 Catatan Disimpan</strong> di perangkat lokal Anda</li>
      </ul>
      <p>Terus pertahankan konsistensi belajar Anda untuk menjadi pribadi yang cakap digital dan aman dari kejahatan siber.</p>
      <p style="margin: 20px 0;">
        <span class="simulated-link-trigger" data-link-idx="0">🚀 Lanjutkan Belajar di CyberWise</span>
      </p>
      <p>Salam hangat,<br><strong>Tim Pengembang CyberWise</strong><br><em>Learn Smart. Stay Secure.</em></p>
    `,
    links: [
      {
        text: '🚀 Lanjutkan Belajar di CyberWise',
        displayedUrl: 'https://farathra.github.io/CyberWise/#/learn',
        actualDestination: 'https://farathra.github.io/CyberWise/#/learn',
        isSuspicious: false,
        explanation: 'Tautan mengarah langsung ke platform resmi CyberWise di GitHub Pages dengan enkripsi HTTPS.'
      }
    ],
    attachments: null,
    clues: [
      {
        id: 'c1',
        text: 'Isi email murni rangkuman aktivitas belajar yang memang sesuai dengan progres pengguna',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c2',
        text: 'Tidak ada permintaan data pribadi, kata sandi, atau pembayaran apapun',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c3',
        text: 'Tautan mengarah tepat ke situs resmi aplikasi CyberWise',
        isSignificant: true,
        points: 25
      },
      {
        id: 'c4',
        text: 'Gaya bahasa suportif dan mendidik tanpa desakan ancaman waktu',
        isSignificant: true,
        points: 25
      }
    ],
    explanation: 'Email ini sah dan aman (*legitimate*). Ini adalah email apresiasi pembelajaran otomatis dari platform CyberWise tanpa ada unsur manipulasi atau ancaman siber.',
    warningSigns: [
      'Tidak ada tanda bahaya',
      'Tautan transparan menuju platform resmi',
      'Konten bersifat positif dan edukatif'
    ],
    recommendation: 'Email motivasi dan rekap progres belajar seperti ini aman dan dapat dijadikan penyemangat dalam melanjutkan materi pembelajaran berikutnya.',
    relatedLessonId: '1-a'
  }
];
