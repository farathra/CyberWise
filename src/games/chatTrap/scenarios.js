// src/games/chatTrap/scenarios.js
// Curated Chat Trap scenarios with gradual progression from Beginner to Intermediate.
// All scenario descriptions, chat messages, choices, and educational feedback are in natural Indonesian.
// Lesson IDs strictly reference existing lessons in materi/manifest.json.

export const CHAT_SCENARIOS = [
  // ── Beginner Scenarios (5) ──────────────────────────────────
  {
    id: 'ct-01',
    difficulty: 'beginner',
    title: 'Permintaan Kode OTP untuk Bonus Diamond Game',
    context: 'Anda menerima pesan dari pemain yang baru Anda kenal di game online. Dia mengaku ingin mengisikan bonus diamond gratis ke akun Anda.',
    contact: {
      name: 'GamerPro_99',
      handle: '@gamerpro_99',
      avatar: '🎮',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Akun baru dibuat 2 hari lalu, tidak memiliki teman bersama, dan berasal dari server tidak dikenal.'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'GamerPro_99',
        text: 'Halo bro! Lu hoki banget nih kepilih dapet giveaway 1.000 Diamond Mobile Legends gratis dari guild kami!',
        time: '14:20'
      },
      {
        sender: 'contact',
        senderName: 'GamerPro_99',
        text: 'Gua udah kirim pulsanya ke nomor HP lu. Coba cek SMS sekarang, ada masuk 6 angka kode verifikasi kan?',
        time: '14:21'
      },
      {
        sender: 'contact',
        senderName: 'GamerPro_99',
        text: 'Cepetan ketik 6 angkanya ke sini ya bro, kodenya cuma aktif 3 menit buat validasi hadiah lu!',
        time: '14:22'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Ketikkan 6 angka kode SMS tersebut agar diamond segera masuk.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Akun game atau media sosial Anda langsung diambil alih karena kode SMS tersebut sebenarnya adalah kode OTP pemulihan kata sandi Anda.'
      },
      {
        id: 'opt-b',
        text: 'Tolak dengan tegas dan jangan pernah membagikan kode OTP atau verifikasi SMS kepada siapa pun.',
        safety: 'safe',
        score: 100,
        consequence: 'Akun Anda aman terlindungi! Kode OTP adalah kunci rahasia sekali pakai yang tidak boleh diberikan kepada siapa pun, termasuk pihak yang mengaku staf game.'
      },
      {
        id: 'opt-c',
        text: 'Berikan 3 digit pertama dulu untuk memastikan apakah orang tersebut jujur.',
        safety: 'unsafe',
        score: 10,
        consequence: 'Memberikan sebagian kode tetap berbahaya karena memberi penyerang petunjuk dan membuka celah manipulasi lebih lanjut.'
      },
      {
        id: 'opt-d',
        text: 'Tanya dulu apa nama guild resminya dan minta bukti tangkapan layar akunnya.',
        safety: 'caution',
        score: 40,
        consequence: 'Meskipun Anda tidak langsung menyerahkan kode, meladeni obrolan tetap membuka ruang bujuk rayu psikologis (social engineering).'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Permintaan Kode Verifikasi / OTP SMS',
        description: 'Kode OTP yang masuk ke ponsel pengguna berfungsi sebagai lapisan keamanan pribadi, bukan syarat penerimaan hadiah.'
      },
      {
        id: 'clue-2',
        title: 'Tekanan Waktu Berlebihan (Urgency)',
        description: 'Penyerang membatasi waktu ("hanya 3 menit") untuk memicu kepanikan dan mencegah korban berpikir jernih.'
      }
    ],
    defenseAdvice: 'Ingat aturan emas keamanan akun: Kode OTP (One-Time Password) bersifat pribadi dan rahasia mutlak. Layanan resmi tidak pernah meminta kode OTP melalui percakapan chat pribadi.',
    conceptKey: 'Perlindungan OTP & Autentikasi',
    relatedLessonId: '4-a'
  },
  {
    id: 'ct-02',
    difficulty: 'beginner',
    title: 'Pesan Tautan Singkat Pemenang Undian Rp 1.000.000',
    context: 'Nomor tidak dikenal mengirim pesan mengabarkan bahwa nomor ponsel Anda memenangkan undian festival belanja tahunan.',
    contact: {
      name: 'Pusat Info Hadiah',
      handle: '+62 899-7711-2233',
      avatar: '🎁',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Menggunakan nomor seluler prabayar biasa, bukan akun bisnis resmi atau pengirim nama institusi (SMS Sender ID).'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Pusat Info Hadiah',
        text: 'Selamat! Nomor Anda terpilih memenangkan Saldo E-Wallet Rp 1.000.000 dari Festival Undian Berkah 2026.',
        time: '10:05'
      },
      {
        sender: 'contact',
        senderName: 'Pusat Info Hadiah',
        text: 'Silakan klaim dana hadiah Anda melalui portal resmi berikut sebelum pukul 12.00 WIB: https://klaim-dana-gratis.example.net/id?claim=992',
        time: '10:06'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Klik tautan tersebut untuk melihat syarat dan ketentuan pengambilan hadiah.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Tautan tersebut membawa Anda ke situs phishing yang meminta nomor ponsel dan PIN akun e-wallet Anda.'
      },
      {
        id: 'opt-b',
        text: 'Jangan klik tautan, abaikan pesan, dan blokir serta laporkan nomor tersebut sebagai spam/penipuan.',
        safety: 'safe',
        score: 100,
        consequence: 'Tindakan yang tepat! Undian resmi tidak dikirim dari nomor pribadi acak dan tidak meminta korban mengklik tautan mencurigakan.'
      },
      {
        id: 'opt-c',
        text: 'Balas chat untuk menanyakan alamat kantor penyelenggara undian.',
        safety: 'caution',
        score: 30,
        consequence: 'Membalas pesan hanya akan memberitahu pelaku bahwa nomor ponsel Anda aktif, sehingga nomor Anda akan terus ditarget spam penipuan.'
      },
      {
        id: 'opt-d',
        text: 'Teruskan tautan ke grup obrolan kelas agar teman-teman ikut membantu mengecek.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Menyebarkan tautan berisiko dapat membuat teman-teman Anda menjadi korban phishing berikutnya.'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Tautan Asing Berdomain example.net',
        description: 'Tautan bukan berasal dari aplikasi perbankan atau e-wallet resmi, melainkan situs jebakan pihak ketiga.'
      },
      {
        id: 'clue-2',
        title: 'Menang Undian yang Tidak Pernah Diikuti',
        description: 'Jika Anda tidak pernah mendaftar undian tertentu, klaim hadiah uang secara tiba-tiba dipastikan adalah modus penipuan.'
      }
    ],
    defenseAdvice: 'Waspadai pesan undian mendadak dari nomor prabayar. Jangan pernah mengklik tautan asing atau memasukkan data login di situs yang tidak dikenal.',
    conceptKey: 'Deteksi Tautan Phishing',
    relatedLessonId: '2-e'
  },
  {
    id: 'ct-03',
    difficulty: 'beginner',
    title: 'Admin Discord Kelas Meminta Kata Sandi Akun',
    context: 'Akun dengan foto profil logo sekolah menghubungi Anda di aplikasi pesan, mengaku sebagai staf admin IT yang sedang melakukan pemeliharaan server.',
    contact: {
      name: 'Admin_IT_Sekolah',
      handle: '@admin_it_sekolah',
      avatar: '🛡️',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Tidak memiliki lencana terverifikasi di server sekolah dan baru bergabung 1 jam yang lalu.'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Admin_IT_Sekolah',
        text: 'Halo siswa. Kami dari divisi IT sedang melakukan sinkronisasi database dan perbaikan sistem e-learning sekolah.',
        time: '16:15'
      },
      {
        sender: 'contact',
        senderName: 'Admin_IT_Sekolah',
        text: 'Akun Anda terindikasi ada error sinkronisasi. Tolong kirimkan username dan kata sandi akun portal belajar Anda untuk kami perbaiki dari sistem pusat.',
        time: '16:16'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Kirimkan kata sandi Anda karena yang meminta mengaku dari pihak IT sekolah.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Akun e-learning Anda dibajak dan penyerang dapat mengubah nilai atau mengakses data pribadi Anda.'
      },
      {
        id: 'opt-b',
        text: 'Tolak memberikan kata sandi dan ingatkan bahwa staf IT yang sah tidak pernah meminta kata sandi pengguna.',
        safety: 'safe',
        score: 100,
        consequence: 'Tepat sekali! Administrator sistem memiliki akses manajemen tanpa perlu mengetahui atau meminta kata sandi rahasia Anda.'
      },
      {
        id: 'opt-c',
        text: 'Kirimkan kata sandi yang salah untuk menguji keaslian admin tersebut.',
        safety: 'caution',
        score: 40,
        consequence: 'Meskipun akun tidak langsung jebol, meladeni penipu menghabiskan waktu dan berisiko memancing manipulasi berikutnya.'
      },
      {
        id: 'opt-d',
        text: 'Minta admin IT tersebut menelepon Anda secara langsung.',
        safety: 'caution',
        score: 50,
        consequence: 'Menelepon balik nomor yang tidak dikenal tetap berisiko terkena manipulasi suara (vishing).'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Permintaan Kata Sandi Akun Pribadi',
        description: 'Prinsip dasar keamanan: Administrator resmi tidak pernah membutuhkan kata sandi pengguna untuk perbaikan teknis.'
      },
      {
        id: 'clue-2',
        title: 'Identitas Mengatasnamakan Instansi',
        description: 'Penyerang sering menggunakan nama "Admin" atau logo resmi untuk membangun rasa tunduk pada otoritas.'
      }
    ],
    defenseAdvice: 'Kata sandi akun hanya boleh diketahui oleh pemilik akun. Tidak ada staf IT, guru, maupun tim bantuan yang sah yang berhak meminta kata sandi Anda.',
    conceptKey: 'Kerahasiaan Kredensial & Kata Sandi',
    relatedLessonId: '4-a'
  },
  {
    id: 'ct-04',
    difficulty: 'beginner',
    title: 'Koordinasi Tugas Kelompok Bersama Teman Sekelas (Percakapan Sah)',
    context: 'Teman sekelompok Anda yang sudah lama dikenal di sekolah mengirim pesan untuk menanyakan file presentasi tugas informatika.',
    contact: {
      name: 'Nadia (Teman Sekelas)',
      handle: '+62 812-4455-6677',
      avatar: '👩‍🎓',
      statusType: 'online',
      verified: true,
      contextClue: 'Nomor sudah tersimpan di kontak ponsel Anda sejak 1 tahun lalu dan ada riwayat obrolan tugas sebelumnya.'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Nadia',
        text: 'Hai! Besok pagi kan giliran kelompok kita maju presentasi bab Keamanan Digital nih.',
        time: '19:30'
      },
      {
        sender: 'contact',
        senderName: 'Nadia',
        text: 'Slide PPT materi yang kemarin kamu edit udah disimpen di Google Drive kelompok belum ya? Mau aku cek urutan slide-nya.',
        time: '19:31'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Curigai sebagai akun hacker dan langsung blokir nomor Nadia tanpa konfirmasi.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Salah paham! Ini adalah percakapan wajar antar teman sekelas yang sah. Sikap keamanan siber yang sehat bukan paranoia tanpa dasar.'
      },
      {
        id: 'opt-b',
        text: 'Jawab dengan ramah dan bagikan link folder Google Drive tugas kelompok yang sudah disepakati bersama.',
        safety: 'safe',
        score: 100,
        consequence: 'Keputusan yang tepat dan proporsional! Kontak ini sah, topik pembicaraan relevan dengan kegiatan sekolah, dan tidak meminta data sensitif pribadi.'
      },
      {
        id: 'opt-c',
        text: 'Minta Nadia mengirimkan foto KTP dan kartu keluarga untuk membuktikan bahwa dia benar-benar Nadia.',
        safety: 'unsafe',
        score: 20,
        consequence: 'Tindakan ini berlebihan dan tidak beralasan untuk obrolan teman sekelas yang nomor kontaknya sudah terverifikasi.'
      },
      {
        id: 'opt-d',
        text: 'Kirimkan alamat email dan kata sandi akun Google pribadi Anda agar Nadia bisa login sendiri.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Sangat berbahaya! Cukup bagikan link dokumen tugas (kolaborasi Drive), jangan pernah meminjamkan akun Google pribadi Anda kepada siapapun.'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Kontak Dikenal & Konteks Relevan',
        description: 'Nomor tersimpan, ada riwayat percakapan sebelumnya, dan topik tugas sesuai dengan agenda sekolah.'
      },
      {
        id: 'clue-2',
        title: 'Tidak Ada Permintaan Data Rahasia',
        description: 'Nadia hanya menanyakan file presentasi kelompok, bukan kata sandi, OTP, atau uang.'
      }
    ],
    defenseAdvice: 'Keamanan digital mengajarkan kehati-hatian berdasarkan bukti konteks, bukan kecurigaan buta terhadap interaksi positif sehari-hari.',
    conceptKey: 'Pembedaan Interaksi Sah vs Ancaman',
    relatedLessonId: '2-d'
  },
  {
    id: 'ct-05',
    difficulty: 'beginner',
    title: 'Permintaan Data Pribadi Lengkap untuk Formulir Kuis',
    context: 'Sebuah akun bot di media sosial mengundang Anda mengikuti kuis kepribadian berhadiah voucher belanja.',
    contact: {
      name: 'Kuis Ceria Indonesia',
      handle: '@kuis_ceria_id',
      avatar: '🤖',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Akun anonim yang secara massal mengirimkan pesan promosi ke banyak pengguna dalam waktu singkat.'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Kuis Ceria Indonesia',
        text: 'Hai Kak! Ikuti Kuis Tes Kecerdasan & Kepribadian 2026, langsung dapat e-voucher belanja Rp 50.000!',
        time: '13:00'
      },
      {
        sender: 'contact',
        senderName: 'Kuis Ceria Indonesia',
        text: 'Untuk validasi data penerima hadiah, mohon kirimkan: Nama Lengkap, NIK KTP, Tanggal Lahir, Alamat Rumah Lengkap, dan Nama Gadis Ibu Kandung.',
        time: '13:01'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Isi seluruh data formulir secara lengkap agar voucher belanja segera dikirimkan.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Data NIK, tanggal lahir, dan nama ibu kandung adalah data verifikasi perbankan penting yang kini berisiko disalahgunakan untuk pinjaman online ilegal atau pembobolan akun.'
      },
      {
        id: 'opt-b',
        text: 'Hentikan percakapan dan tolak menyerahkan data identitas kependudukan sensitif.',
        safety: 'safe',
        score: 100,
        consequence: 'Pilihan yang sangat bijak! Kuis hiburan tidak memiliki alasan yang sah untuk meminta data sensitif seperti NIK dan nama gadis ibu kandung.'
      },
      {
        id: 'opt-c',
        text: 'Kirimkan data palsu milik tetangga atau teman sekelas Anda.',
        safety: 'unsafe',
        score: 10,
        consequence: 'Membagikan data orang lain melanggar etika dan privasi, serta tetap membuat Anda terjerat dalam ekosistem penipuan.'
      },
      {
        id: 'opt-d',
        text: 'Kirimkan NIK dan tanggal lahir saja, tetapi sembunyikan nama ibu kandung.',
        safety: 'unsafe',
        score: 20,
        consequence: 'NIK dan tanggal lahir tetap merupakan data pribadi sensitif (Personally Identifiable Information) yang wajib dilindungi kerahasiaannya.'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Permintaan Data Sensitif Berlebih (PII)',
        description: 'NIK dan Nama Ibu Kandung adalah kunci verifikasi keamanan perbankan dan kependudukan tingkat tinggi.'
      },
      {
        id: 'clue-2',
        title: 'Umpan Hadiah Murah untuk Data Berharga',
        description: 'Taktik harvesting data: mengiming-imingi voucher kecil untuk mengumpulkan data identitas berharga mahal.'
      }
    ],
    defenseAdvice: 'Lindungi Data Pribadi Sensitif (PII). Jangan pernah menyerahkan NIK, nama ibu kandung, atau alamat domisili untuk kuis online atau layanan tidak resmi.',
    conceptKey: 'Perlindungan Data Pribadi (PII)',
    relatedLessonId: '1-b'
  },

  // ── Intermediate Scenarios (5) ──────────────────────────────
  {
    id: 'ct-06',
    difficulty: 'intermediate',
    title: 'Teman Mengaku Ganti Nomor & Minta Pinjam Uang Darurat',
    context: 'Nomor baru yang belum tersimpan mengirim pesan mengaku sebagai Rian (sahabat Anda). Foto profilnya memang foto Rian, tetapi gaya bahasanya terburu-buru.',
    contact: {
      name: 'Rian (+62 857-8899-0011)',
      handle: '+62 857-8899-0011',
      avatar: '🏃',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Nomor baru tidak dikenal. Foto profil menggunakan foto Rian yang diunduh dari akun Instagram publik.'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Rian (Nomor Baru)',
        text: 'Bro, ini gua Rian! HP gua yang lama kecopetan pas turun di stasiun tadi, ini pake nomor darurat temen gua.',
        time: '17:40'
      },
      {
        sender: 'contact',
        senderName: 'Rian (Nomor Baru)',
        text: 'Gua bener-bener panik kehabisan ongkos buat pulang. Bisa tolong transferin Rp 100.000 ke rekening ini dulu ga? Begitu nyampe rumah langsung diganti sama ortu gua.',
        time: '17:41'
      },
      {
        sender: 'contact',
        senderName: 'Rian (Nomor Baru)',
        text: 'Jangan telepon ya bro, batre tinggal 2% dan sinyal di stasiun putus-putus. Cepetan ya bro, darurat banget!',
        time: '17:42'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Langsung transfer uang karena kasihan dan takut sahabat Anda terlantar di stasiun.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Uang Anda hilang ke rekening penipu. Modus pembajakan identitas teman dengan alasan ganti nomor ponsel darurat adalah trik social engineering klasik.'
      },
      {
        id: 'opt-b',
        text: 'Tunda transfer, hubungi nomor lama Rian atau telepon orang tuanya melalui jalur terpisah untuk verifikasi identitas.',
        safety: 'safe',
        score: 100,
        consequence: 'Langkah investigasi yang luar biasa! Saat Anda mengonfirmasi ke nomor rumah Rian, Rian ternyata sedang ada di kamarnya dan tidak pernah kehilangan HP.'
      },
      {
        id: 'opt-c',
        text: 'Minta orang tersebut mengirimkan voice note atau menjawab pertanyaan rahasia yang hanya diketahui Anda dan Rian.',
        safety: 'caution',
        score: 60,
        consequence: 'Pertanyaan rahasia adalah taktik yang baik, namun verifikasi melalui jalur komunikasi terpisah yang sudah terpercaya tetap merupakan standar teraman.'
      },
      {
        id: 'opt-d',
        text: 'Marahi pengirim pesan dan langsung memblokirnya tanpa mengecek kebenaran kabar teman Anda.',
        safety: 'caution',
        score: 30,
        consequence: 'Meskipun uang aman, bersikap pasif tanpa memverifikasi membuat Anda tidak dapat memperingatkan teman Anda bahwa fotonya sedang disalahgunakan penipu.'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Alibi Menolak Panggilan Suara / Telepon',
        description: 'Pelaku beralasan "baterai mau habis" atau "sinyal jelek" agar suaranya tidak terbukti berbeda dengan teman asli Anda.'
      },
      {
        id: 'clue-2',
        title: 'Manipulasi Emosional & Kepanikan (Urgency)',
        description: 'Memanfaatkan rasa solidaritas pertemanan agar korban segera bertindak tanpa sempat berpikir kritis.'
      }
    ],
    defenseAdvice: 'Prinsip Out-of-Band Verification: Bila ada kontak baru yang mengaku orang dekat meminta uang atau hal darurat, selalu verifikasi lewat kontak lama atau pihak ketiga yang tepercaya.',
    conceptKey: 'Verifikasi Identitas Jalur Terpisah',
    relatedLessonId: '2-b'
  },
  {
    id: 'ct-07',
    difficulty: 'intermediate',
    title: 'Customer Service Palsu Bank Meminta Unduh Berkas .APK',
    context: 'Sebuah akun WhatsApp Bisnis dengan logo bank terkemuka mengirim peringatan transaksi mencurigakan pada akun e-wallet Anda.',
    contact: {
      name: 'Halo Layanan Nasabah',
      handle: '+62 821-3344-5566',
      avatar: '🏦',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Menggunakan logo bank sebagai foto profil, namun nomornya adalah nomor seluler biasa (+62 821...), bukan nomor Call Center resmi perbankan (biasanya 5 digit).'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Halo Layanan Nasabah',
        text: 'Pemberitahuan Keamanan: Terdeteksi upaya transaksi mencurigakan senilai Rp 750.000 pada akun finansial Anda dari perangkat yang tidak dikenal.',
        time: '09:15'
      },
      {
        sender: 'contact',
        senderName: 'Halo Layanan Nasabah',
        text: 'Untuk membatalkan transaksi dan mengamankan saldo, Anda diwajibkan mengunduh serta memasang aplikasi pemeriksa keamanan berikut: Pemeriksa_Keamanan_Bank.apk (4.2 MB)',
        time: '09:16'
      },
      {
        sender: 'contact',
        senderName: 'Halo Layanan Nasabah',
        text: 'Peringatan: Jika tidak dipasang dalam 30 menit, akun Anda akan dibekukan permanen oleh sistem.',
        time: '09:17'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Unduh dan pasang berkas .APK tersebut agar transaksi mencurigakan segera dibatalkan.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Malware trojan pencuri SMS/OTP terpasang di ponsel Anda. Penyerang kini dapat menyadap seluruh SMS OTP perbankan Anda secara otomatis.'
      },
      {
        id: 'opt-b',
        text: 'Jangan unduh file tersebut, hubungi customer service resmi bank melalui nomor resmi di belakang kartu ATM atau aplikasi resmi.',
        safety: 'safe',
        score: 100,
        consequence: 'Keputusan sangat tepat! Bank resmi tidak pernah membagikan file instalasi .APK lewat chat dan hanya merilis aplikasi melalui Google Play Store / App Store resmi.'
      },
      {
        id: 'opt-c',
        text: 'Kirimkan berkas .APK tersebut ke grup keluarga untuk meminta pendapat orang tua.',
        safety: 'caution',
        score: 20,
        consequence: 'Menyebarkan berkas APK berbahaya berisiko tinggi membuat anggota keluarga lain tidak sengaja mengkliknya.'
      },
      {
        id: 'opt-d',
        text: 'Balas chat dengan menanyakan nama lengkap petugas dan nomor induk pegawai.',
        safety: 'caution',
        score: 40,
        consequence: 'Penipu ulung dapat dengan mudah mengarang nama palsu atau nomor pegawai fiktif untuk meyakinkan Anda.'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Pengiriman Berkas APK Lewat Chat',
        description: 'Trik distribusi malware berbahaya (Sniffer APK) yang menyamar sebagai dokumen, undangan, atau aplikasi perbankan.'
      },
      {
        id: 'clue-2',
        title: 'Ancaman Pemblokiran Akun Sepihak',
        description: 'Menciptakan rasa takut kehilangan uang agar korban terburu-buru memasang malware tanpa memeriksa izin aplikasi.'
      }
    ],
    defenseAdvice: 'Jangan pernah memasang berkas instalasi aplikasi (.APK) yang dikirimkan melalui aplikasi chat. Selalu unduh aplikasi hanya dari toko resmi (Play Store / App Store).',
    conceptKey: 'Pencegahan Malware Berkas APK',
    relatedLessonId: '3-c'
  },
  {
    id: 'ct-08',
    difficulty: 'intermediate',
    title: 'Tawaran Kerja Freelance Like Video dengan Sistem Deposit (Task Scam)',
    context: 'Seorang perekrut kerja paruh waktu menghubungi Anda, menawarkan penghasilan ratusan ribu hanya dengan menyukai video YouTube.',
    contact: {
      name: 'Jessica - Talent HR Global',
      handle: '+62 878-1122-3344',
      avatar: '💼',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Nomor terdaftar di wilayah luar negeri atau prabayar acak, dan tidak ada informasi perusahaan yang sah.'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Jessica HR',
        text: 'Halo! Kami dari agensi optimasi media sosial sedang mencari pelajar/mahasiswa untuk pekerjaan freelance paruh waktu santai.',
        time: '11:10'
      },
      {
        sender: 'contact',
        senderName: 'Jessica HR',
        text: 'Tugasnya cuma like 3 video YouTube, langsung dapat komisi Rp 30.000 cair ke e-wallet. Tugas pertama sudah berhasil dan dananya sudah kami transfer ya!',
        time: '11:12'
      },
      {
        sender: 'contact',
        senderName: 'Jessica HR',
        text: 'Untuk lanjut ke Tugas VIP Komisi Rp 500.000, Anda cukup transfer deposit jaminan tugas sebesar Rp 150.000 ke rekening bendahara kami. Nanti uang deposit kembali 100% plus bonus!',
        time: '11:15'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Transfer deposit Rp 150.000 karena sudah terbukti tugas pertama benar-benar dibayar.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Anda masuk perangkap Task Scam (penipuan tugas). Pembayaran kecil pertama hanyalah umpan, uang deposit Anda tidak akan pernah kembali dan pelaku akan meminta deposit yang lebih besar.'
      },
      {
        id: 'opt-b',
        text: 'Tolak menyetor uang, sadari pola penipuan tugas berbayar (task scam), lalu hentikan kontak dan laporkan akun.',
        safety: 'safe',
        score: 100,
        consequence: 'Analisis yang tajam! Pekerjaan nyata membayar tenaga pekerja, bukan mewajibkan pekerja menyetor uang deposit untuk mendapatkan tugas.'
      },
      {
        id: 'opt-c',
        text: 'Tawar jumlah deposit menjadi Rp 50.000 agar risikonya lebih kecil.',
        safety: 'unsafe',
        score: 20,
        consequence: 'Menawar tetap membuat Anda kehilangan uang kepada komplotan penipu online.'
      },
      {
        id: 'opt-d',
        text: 'Ajak teman sekelas ikut bergabung agar bisa patungan membayar uang deposit VIP.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Menjerumuskan orang lain ke dalam skema penipuan berantai.'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Umpan Pembayaran Awal (Lure/Bait)',
        description: 'Memberikan uang nominal kecil di awal untuk membangun rasa percaya semu sebelum meminta deposit besar.'
      },
      {
        id: 'clue-2',
        title: 'Syarat Deposit untuk Bekerja',
        description: 'Ciri mutlak penipuan kerja daring: pekerja diminta menyetorkan uang jaminan untuk mencairkan komisi.'
      }
    ],
    defenseAdvice: 'Waspadai modus penipuan tugas berbayar (task scam). Pekerjaan yang sah tidak pernah meminta calon pekerja mentransfer uang muka atau deposit.',
    conceptKey: 'Deteksi Penipuan Finansial Online',
    relatedLessonId: '2-e'
  },
  {
    id: 'ct-09',
    difficulty: 'intermediate',
    title: 'Permintaan Dokumen Rahasia Mengatasnamakan Wakil Kepala Sekolah',
    context: 'Sebuah kontak dengan foto profil Wakil Kepala Sekolah bidang Kurikulum menghubungi Anda pada pukul 23.30 malam.',
    contact: {
      name: 'Drs. H. Mulyono (Kesiswaan)',
      handle: '+62 813-9900-1122',
      avatar: '👨‍🏫',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Menggunakan foto resmi sekolah, namun chat dikirim tengah malam di luar jam kerja dari nomor yang tidak terdaftar di buku direktori sekolah.'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Pak Mulyono',
        text: 'Malam nak. Bapak sedang ada rapat darurat dengan dinas pendidikan terkait akreditasi dan persiapan lomba olimpiade sekolah.',
        time: '23:30'
      },
      {
        sender: 'contact',
        senderName: 'Pak Mulyono',
        text: 'Tolong kirimkan file draf master soal olimpiade sains yang ada di drive komputer OSIS sekarang juga ke nomor ini.',
        time: '23:31'
      },
      {
        sender: 'contact',
        senderName: 'Pak Mulyono',
        text: 'Ingat nak, jangan bicarakan atau tanyakan ini ke guru lain atau teman OSIS ya. Ini instruksi rahasia langsung dari pimpinan sekolah demi nama baik sekolah kita.',
        time: '23:32'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Langsung kirimkan file dokumen karena merasa segan dan takut dihukum oleh wakil kepala sekolah.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Dokumen rahasia sekolah bocor ke pihak luar. Penyerang memanfaatkan rasa takut terhadap figur otoritas sekolah.'
      },
      {
        id: 'opt-b',
        text: 'Tahan pengiriman dokumen, tolak permintaan menjaga rahasia yang melanggar SOP, dan konfirmasi langsung ke sekolah esok pagi.',
        safety: 'safe',
        score: 100,
        consequence: 'Keputusan yang sangat profesional dan berintegritas! Menolak permintaan bypass prosedur dan permintaan menjaga rahasia mencurigakan adalah pertahanan keamanan terbaik.'
      },
      {
        id: 'opt-c',
        text: 'Kirimkan setengah draf dokumen saja untuk menunjukkan kepatuhan.',
        safety: 'unsafe',
        score: 20,
        consequence: 'Membocorkan sebagian dokumen rahasia tetap merupakan pelanggaran keamanan informasi.'
      },
      {
        id: 'opt-d',
        text: 'Minta nomor rekening sekolah untuk menyalurkan biaya administrasi lomba.',
        safety: 'caution',
        score: 40,
        consequence: 'Membahas uang pada pesan yang sudah jelas mencurigakan justru membuka peluang penipuan lebih lanjut.'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Tuntutan Kerahasiaan Mencurigakan ("Jangan Bilang Siapa-siapa")',
        description: 'Taktik manipulasi isolasi korban agar tidak sempat berkonsultasi atau memverifikasi dengan orang lain.'
      },
      {
        id: 'clue-2',
        title: 'Waktu Tidak Wajar & Pelanggaran Prosedur Resmi',
        description: 'Instruksi resmi kedinasan sekolah disampaikan pada jam kerja melalui saluran resmi, bukan chat larut malam ke nomor pribadi.'
      }
    ],
    defenseAdvice: 'Bila seseorang meminta Anda mengabaikan prosedur resmi atau menuntut kerahasiaan mencurigakan, selalu hentikan proses dan konfirmasi langsung ke pihak yang berwenang.',
    conceptKey: 'Pencegahan Manipulasi Otoritas',
    relatedLessonId: '4-b'
  },
  {
    id: 'ct-10',
    difficulty: 'intermediate',
    title: 'Ancaman Hapus Akun Media Sosial karena Pelanggaran Hak Cipta',
    context: 'Sebuah pesan langsung mengklaim dari Tim Keamanan Hak Cipta Media Sosial, menuduh postingan foto Anda melanggar hak kekayaan intelektual.',
    contact: {
      name: 'Instagram Copyright Appeal Center',
      handle: '@help_support_copyright_2026',
      avatar: '⚖️',
      statusType: 'unknown',
      verified: false,
      contextClue: 'Akun pengirim tidak memiliki centang biru resmi, menggunakan username kombinasi acak, dan tautan mengarah ke domain pihak ketiga bukan instagram.com.'
    },
    messages: [
      {
        sender: 'contact',
        senderName: 'Copyright Support',
        text: 'Pemberitahuan Pelanggaran Hak Cipta: Postingan terbaru pada akun Anda telah dilaporkan atas pelanggaran hak cipta visual komersial.',
        time: '08:45'
      },
      {
        sender: 'contact',
        senderName: 'Copyright Support',
        text: 'Jika Anda yakin ini adalah kekeliruan, Anda wajib mengajukan formulir sanggahan banding dalam kurun waktu 24 jam melalui tautan: https://ig-copyright-center.example.org/appeal/form',
        time: '08:46'
      },
      {
        sender: 'contact',
        senderName: 'Copyright Support',
        text: 'Kegagalan mengajukan banding akan menyebabkan akun Anda dinonaktifkan secara permanen dan tidak dapat dipulihkan kembali.',
        time: '08:47'
      }
    ],
    options: [
      {
        id: 'opt-a',
        text: 'Buka tautan formulir banding dan masukkan username serta kata sandi akun untuk membatalkan penghapusan.',
        safety: 'unsafe',
        score: 0,
        consequence: 'Kredensial akun Anda dicuri oleh halaman phishing kloningan. Penyerang langsung mengganti email dan nomor pemulihan akun Anda.'
      },
      {
        id: 'opt-b',
        text: 'Abaikan tautan chat, buka aplikasi Instagram resmi, dan periksa menu resmi "Pengaturan > Akun > Status Akun".',
        safety: 'safe',
        score: 100,
        consequence: 'Sempurna! Platform media sosial resmi mengirimkan pemberitahuan pelanggaran melalui notifikasi sistem di menu Status Akun aplikasi resmi, bukan melalui pesan langsung (DM).'
      },
      {
        id: 'opt-c',
        text: 'Kirim pesan balasan minta maaf dan mohon agar akun tidak dihapus.',
        safety: 'caution',
        score: 30,
        consequence: 'Membalas DM penipu tidak akan menyelesaikan masalah dan hanya menunjukkan kepanikan yang dimanfaatkan pelaku.'
      },
      {
        id: 'opt-d',
        text: 'Segera hapus semua foto di akun Anda agar terhindar dari pemblokiran.',
        safety: 'caution',
        score: 20,
        consequence: 'Tindakan gegabah akibat panik yang tidak perlu karena laporan tersebut hanyalah tipu muslihat phisher.'
      }
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Tautan Banding Palsu di Luar Domain Resmi',
        description: 'Tautan menggunakan domain example.org, bukan domain resmi platform (instagram.com).'
      },
      {
        id: 'clue-2',
        title: 'Taktik Menakut-nakuti (Fear Appeal / Intimidation)',
        description: 'Mengancam penghapusan akun permanen dalam 24 jam agar korban panik dan tidak memeriksa kebenaran informasi.'
      }
    ],
    defenseAdvice: 'Periksa status akun dan pelanggaran hak cipta selalu melalui menu pengaturan resmi di dalam aplikasi, bukan melalui tautan formulir yang dikirim lewat pesan chat atau DM.',
    conceptKey: 'Pencegahan Phishing Hak Cipta & Ketakutan',
    relatedLessonId: '2-b'
  }
];
