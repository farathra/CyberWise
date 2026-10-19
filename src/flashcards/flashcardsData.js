// src/flashcards/flashcardsData.js
// Curated cybersecurity flashcards repository covering the 4 curriculum chapters
// Educational content, questions, answers, hints, and explanations remain in natural Indonesian.

export const FLASHCARDS_DATA = [
  // ── BAB 1: Keamanan Data dan Informasi ──────────────────────
  {
    id: 'fc-1-a-1',
    chapterId: '1',
    subchapterId: '1-a',
    chapterTitle: 'Keamanan Data dan Informasi',
    subchapterTitle: 'Pengertian Keamanan Digital',
    front: 'Apa tiga pilar fundamental dalam keamanan informasi yang dikenal sebagai Triad CIA?',
    back: 'Confidentiality (Kerahasiaan), Integrity (Integritas/Keutuhan), dan Availability (Ketersediaan).',
    hint: 'Tiga pilar ini disingkat dengan huruf awal C - I - A.',
    explanation: 'Triad CIA adalah standar utama keamanan siber: memastikan data hanya diakses pihak berwenang (Kerahasiaan), data tidak dimanipulasi tanpa izin (Integritas), dan data siap diakses saat dibutuhkan (Ketersediaan).',
    lessonUrl: '#/learn/1-a'
  },
  {
    id: 'fc-1-a-2',
    chapterId: '1',
    subchapterId: '1-a',
    chapterTitle: 'Keamanan Data dan Informasi',
    subchapterTitle: 'Pengertian Keamanan Digital',
    front: 'Mengapa "Non-repudiation" (Penyangkalan Tidak Sah) penting dalam transaksi digital?',
    back: 'Menjamin pelaku transaksi tidak dapat menyangkal bahwa ia telah melakukan pengiriman pesan atau tindakan transaksi.',
    hint: 'Berkaitan dengan bukti sah pengirim, seperti tanda tangan digital.',
    explanation: 'Non-repudiation memastikan adanya bukti forensik digital (misalnya melalui kriptografi kunci publik dan log audit) sehingga pengirim tidak dapat membantah keterlibatannya.',
    lessonUrl: '#/learn/1-a'
  },
  {
    id: 'fc-1-a-3',
    chapterId: '1',
    subchapterId: '1-a',
    chapterTitle: 'Keamanan Data dan Informasi',
    subchapterTitle: 'Pengertian Keamanan Digital',
    front: 'Apa perbedaan mendasar antara "Threat" (Ancaman) dan "Vulnerability" (Kerentanan)?',
    back: 'Threat adalah potensi kejadian berbahaya, sedangkan Vulnerability adalah kelemahan sistem yang dapat dieksploitasi oleh ancaman.',
    hint: 'Satu adalah bahaya dari luar, satu lagi adalah celah pada pertahanan.',
    explanation: 'Contoh: Peretas adalah ancaman (threat), sedangkan perangkat lunak yang tidak pernah diperbarui adalah kerentanan (vulnerability). Risiko muncul saat ancaman mengeksploitasi kerentanan.',
    lessonUrl: '#/learn/1-a'
  },
  {
    id: 'fc-1-b-1',
    chapterId: '1',
    subchapterId: '1-b',
    chapterTitle: 'Keamanan Data dan Informasi',
    subchapterTitle: 'Definisi Keamanan Data dan Informasi',
    front: 'Apa yang dimaksud dengan "Data At Rest", "Data In Transit", dan "Data In Use"?',
    back: 'Tiga kondisi status data: data tersimpan dalam media penyimpanan (At Rest), data yang sedang ditransmisikan melalui jaringan (In Transit), dan data yang sedang diproses di memori/RAM (In Use).',
    hint: 'Fokus pada posisi dan status data: diam di disk, bergerak di kabel/wifi, atau diproses prosesor.',
    explanation: 'Strategi pertahanan siber harus melindungi data di ketiga kondisi tersebut, misalnya menggunakan BitLocker/FileVault untuk At Rest, TLS/HTTPS untuk In Transit, dan isolasi memori untuk In Use.',
    lessonUrl: '#/learn/1-b'
  },
  {
    id: 'fc-1-b-2',
    chapterId: '1',
    subchapterId: '1-b',
    chapterTitle: 'Keamanan Data dan Informasi',
    subchapterTitle: 'Definisi Keamanan Data dan Informasi',
    front: 'Mengapa Data Pribadi Sensitif (PII - Personally Identifiable Information) memerlukan perlindungan hukum khusus?',
    back: 'Karena jika bocor dapat memicu pencurian identitas, penipuan finansial, pemerasan, dan pelanggaran privasi individu.',
    hint: 'PII meliputi NIK, nama ibu kandung, rekam medis, dan data biometrik.',
    explanation: 'Undang-Undang Perlindungan Data Pribadi (UU PDP) mewajibkan pengendali data menerapkan enkripsi dan kontrol akses ketat terhadap data pribadi warga negara.',
    lessonUrl: '#/learn/1-b'
  },
  {
    id: 'fc-1-c-1',
    chapterId: '1',
    subchapterId: '1-c',
    chapterTitle: 'Keamanan Data dan Informasi',
    subchapterTitle: 'Perbedaan Data dan Informasi dalam Konteks Keamanan',
    front: 'Bagaimana hubungan perubahan dari "Data Mentah" menjadi "Informasi" mempengaruhi nilai risikonya?',
    back: 'Data mentah yang diproses dan diberi konteks menjadi informasi strategis yang memiliki nilai ekonomi dan risiko kerugian yang jauh lebih tinggi jika bocor.',
    hint: 'Kumpulan angka biner vs laporan keuangan perusahaan yang sudah jadi.',
    explanation: 'Contoh: Rangkaian log koneksi mentah adalah data, namun saat diolah menjadi pola kebiasaan atau rahasia perbankan nasabah, nilainya melonjak sehingga membutuhkan proteksi lebih ketat.',
    lessonUrl: '#/learn/1-c'
  },
  {
    id: 'fc-1-c-2',
    chapterId: '1',
    subchapterId: '1-c',
    chapterTitle: 'Keamanan Data dan Informasi',
    subchapterTitle: 'Perbedaan Data dan Informasi dalam Konteks Keamanan',
    front: 'Apa prinsip "Klasifikasi Data" yang umum diterapkan pada organisasi keamanan?',
    back: 'Pengelompokan data berdasarkan tingkat sensitivitasnya: Publik (Public), Internal, Rahasia (Confidential), dan Sangat Rahasia (Restricted).',
    hint: 'Tingkatan label privasi dari yang bebas dibaca umum hingga rahasia negara/perusahaan.',
    explanation: 'Klasifikasi data mempermudah penentuan siapa yang berhak mengakses dan teknologi proteksi apa yang wajib dipasang pada berkas bersangkutan.',
    lessonUrl: '#/learn/1-c'
  },

  // ── BAB 2: Mengenal Dampak Teknologi Digital ─────────────────
  {
    id: 'fc-2-a-1',
    chapterId: '2',
    subchapterId: '2-a',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Definisi Teknologi Digital',
    front: 'Mengapa representasi data biner (0 dan 1) menjadi dasar seluruh komputasi digital modern?',
    back: 'Karena sinyal diskrit biner (on/off) memiliki toleransi tinggi terhadap noise dan gangguan listrik dibanding sinyal analog.',
    hint: 'Komputer menggunakan saklar transistor elektronik.',
    explanation: 'Transistor hanya perlu membedakan kondisi ada tegangan (1) atau tidak ada tegangan (0), menghasilkan transmisi data yang presisi tanpa distorsi sinyal.',
    lessonUrl: '#/learn/2-a'
  },
  {
    id: 'fc-2-a-2',
    chapterId: '2',
    subchapterId: '2-a',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Definisi Teknologi Digital',
    front: 'Apa peran perangkat lunak (software) sistem operasi dalam mengelola keamanan komputasi?',
    back: 'Menyediakan lapisan isolasi proses, kontrol hak akses berkas, manajemen memori aman, dan autentikasi pengguna.',
    hint: 'Sistem operasi menjembatani perangkat keras dengan aplikasi pengguna.',
    explanation: 'OS modern menerapkan pemisahan User Space dan Kernel Space untuk mencegah aplikasi berbahaya merusak inti sistem perangkat keras.',
    lessonUrl: '#/learn/2-a'
  },
  {
    id: 'fc-2-b-1',
    chapterId: '2',
    subchapterId: '2-b',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Peran Teknologi Digital dalam Kehidupan Sehari-hari',
    front: 'Apa risiko keamanan siber terbesar yang timbul dari maraknya perangkat IoT (Internet of Things)?',
    back: 'Banyak perangkat IoT tidak memiliki pembaruan keamanan, memakai kata sandi default pabrik, dan rentan dijadikan botnet serangan DDoS.',
    hint: 'Pikirkan kamera CCTV, smart bulb, atau router rumah yang jarang di-update.',
    explanation: 'Peretas dapat menginfeksi ribuan perangkat IoT yang tidak terproteksi (seperti pada insiden Mirai Botnet) untuk melumpuhkan infrastruktur internet global.',
    lessonUrl: '#/learn/2-b'
  },
  {
    id: 'fc-2-b-2',
    chapterId: '2',
    subchapterId: '2-b',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Peran Teknologi Digital dalam Kehidupan Sehari-hari',
    front: 'Mengapa transaksi perbankan digital mewajibkan penggunaan OTP (One-Time Password) yang dinamis?',
    back: 'Untuk mencegah serangan Replay Attack dan membentengi akun jika kata sandi utama pengguna telah bocor.',
    hint: 'Kode sementara yang hanya berlaku 30-60 detik.',
    explanation: 'OTP dinamis memiliki masa kedaluwarsa cepat dan hanya bisa dipakai sekali, sehingga tidak berguna bagi penyerang meskipun berhasil disadap setelah transaksi usai.',
    lessonUrl: '#/learn/2-b'
  },
  {
    id: 'fc-2-c-1',
    chapterId: '2',
    subchapterId: '2-c',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Perkembangan Teknologi Digital dari Masa ke Masa',
    front: 'Apa pergeseran paradigma keamanan saat komputasi beralih dari On-Premise ke Cloud Computing?',
    back: 'Model Tanggung Jawab Bersama (Shared Responsibility Model), di mana keamanan fisik ditangani penyedia cloud namun konfigurasi akses data tetap tanggung jawab pengguna.',
    hint: 'Penyedia cloud menjaga gedung server, tapi siapa yang mengatur password akun Anda?',
    explanation: 'Pengguna cloud tidak boleh berasumsi data mereka otomatis aman tanpa mengonfigurasi enkripsi, IAM (Identity and Access Management), dan kontrol akses publik.',
    lessonUrl: '#/learn/2-c'
  },
  {
    id: 'fc-2-c-2',
    chapterId: '2',
    subchapterId: '2-c',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Perkembangan Teknologi Digital dari Masa ke Masa',
    front: 'Mengapa protokol internet lama seperti HTTP, FTP, dan Telnet kini ditinggalkan?',
    back: 'Karena mengirimkan data dan kredensial pengguna dalam bentuk teks polos (plain text) tanpa enkripsi sehingga mudah disadap.',
    hint: 'Ketiadaan huruf "S" (Secure) yang menandakan enkripsi.',
    explanation: 'Kini standar industri mewajibkan HTTPS, SFTP, dan SSH yang mengenkripsi seluruh muatan data menggunakan protokol SSL/TLS.',
    lessonUrl: '#/learn/2-c'
  },
  {
    id: 'fc-2-d-1',
    chapterId: '2',
    subchapterId: '2-d',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Dampak Positif dan Negatif Teknologi Digital',
    front: 'Apa bahaya dari "Jejak Digital" (Digital Footprint) yang ditinggalkan di media sosial terhadap keamanan pribadi?',
    back: 'Dapat dieksploitasi oleh penyerang untuk merancang serangan rekayasa sosial (Social Engineering) dan menebak pertanyaan pemulihan akun.',
    hint: 'Foto tiket pesawat, lokasi tempat tinggal, nama hewan peliharaan, atau tanggal lahir.',
    explanation: 'OSINT (Open Source Intelligence) sering dipakai penipu untuk mengumpulkan data korban sebelum melancarkan spear phishing yang sangat meyakinkan.',
    lessonUrl: '#/learn/2-d'
  },
  {
    id: 'fc-2-d-2',
    chapterId: '2',
    subchapterId: '2-d',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Dampak Positif dan Negatif Teknologi Digital',
    front: 'Apa itu "Doxing" dan mengapa tindakan ini berbahaya bagi keamanan digital korban?',
    back: 'Penyebarluasan informasi pribadi korban secara publik tanpa izin dengan tujuan intimidasi, persekusi, atau pelecehan.',
    hint: 'Membongkar nomor telepon, alamat rumah, atau KTP seseorang ke forum publik.',
    explanation: 'Doxing dapat memicu pelecehan di dunia nyata, pembajakan akun (SIM Swap), dan serangan fisik maupun finansial terhadap korban dan keluarganya.',
    lessonUrl: '#/learn/2-d'
  },
  {
    id: 'fc-2-e-1',
    chapterId: '2',
    subchapterId: '2-e',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Cara Mengatasi Dampak Negatif Teknologi Digital',
    front: 'Apa langkah awal paling efektif saat menyadari akun media sosial atau email Anda telah diretas?',
    back: 'Segera ubah kata sandi, aktifkan opsi "Keluar dari Semua Perangkat" (Sign out all sessions), nyalakan 2FA, dan periksa riwayat login.',
    hint: 'Putuskan akses penyusup sebelum mereka mengubah email pemulihan.',
    explanation: 'Memutus sesi aktif memaksa penyerang keluar dari akun, sementara pergantian kata sandi dan pengaktifan 2FA menutup akses kembali.',
    lessonUrl: '#/learn/2-e'
  },
  {
    id: 'fc-2-e-2',
    chapterId: '2',
    subchapterId: '2-e',
    chapterTitle: 'Mengenal Dampak Teknologi Digital',
    subchapterTitle: 'Cara Mengatasi Dampak Negatif Teknologi Digital',
    front: 'Mengapa menghubungkan perangkat ke jaringan Wi-Fi Publik tanpa perlindungan VPN berbahaya?',
    back: 'Penyerang di jaringan yang sama dapat melakukan sniffing data dan serangan Man-in-the-Middle (MitM) untuk menyadap lalu lintas data.',
    hint: 'Jaringan gratis di kafe atau bandara tidak memiliki enkripsi antar-perangkat.',
    explanation: 'VPN (Virtual Private Network) membuat terowongan enkripsi aman sehingga pihak ketiga di jaringan Wi-Fi publik tidak dapat melihat isi data yang Anda kirimkan.',
    lessonUrl: '#/learn/2-e'
  },

  // ── BAB 3: Malware (Malicious Software) ──────────────────────
  {
    id: 'fc-3-a-1',
    chapterId: '3',
    subchapterId: '3-a',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Pengertian Malware',
    front: 'Apa definisi umum dari "Malware" dan apa tujuan utama pembuatannya?',
    back: 'Perangkat lunak yang dirancang secara sengaja untuk merusak, mengganggu, menyusup, atau mencuri data dari sistem komputer tanpa izin pemiliknya.',
    hint: 'Singkatan dari Malicious Software.',
    explanation: 'Motivasi pembuat malware meliputi keuntungan finansial (ransomware), spionase siber, sabotase infrastruktur, hingga pencurian kredensial akun.',
    lessonUrl: '#/learn/3-a'
  },
  {
    id: 'fc-3-a-2',
    chapterId: '3',
    subchapterId: '3-a',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Pengertian Malware',
    front: 'Sebutkan 3 gejala umum bahwa sebuah komputer telah terinfeksi malware berbahaya!',
    back: '1. Kinerja sistem melambat drastis tanpa sebab. 2. Muncul jendela pop-up asing berulang kali. 3. Berkas tiba-tiba hilang atau terenkripsi dengan ekstensi asing.',
    hint: 'Perhatikan kinerja CPU/RAM, iklan aneh, dan berkas yang tidak bisa dibuka.',
    explanation: 'Malware sering menjalankan proses tersembunyi di latar belakang yang memakan sumber daya perangkat keras dan memodifikasi file sistem.',
    lessonUrl: '#/learn/3-a'
  },
  {
    id: 'fc-3-b-1',
    chapterId: '3',
    subchapterId: '3-b',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Jenis-Jenis Malware',
    front: 'Apa perbedaan mendasar antara Virus komputer dan Worm?',
    back: 'Virus membutuhkan file induk (host) dan tindakan manusia untuk menyebar, sedangkan Worm dapat menggandakan diri dan menyebar mandiri melalui celah jaringan.',
    hint: 'Satu butuh menempel pada program lain, satu lagi bergerak sendiri melintasi kabel jaringan.',
    explanation: 'Contoh: Virus menyebar saat korban membuka file .exe yang terinfeksi. Worm menyebar otomatis ke seluruh komputer di jaringan lokal tanpa interaksi pengguna.',
    lessonUrl: '#/learn/3-b'
  },
  {
    id: 'fc-3-b-2',
    chapterId: '3',
    subchapterId: '3-b',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Jenis-Jenis Malware',
    front: 'Bagaimana cara kerja Trojan Horse dan mengapa malware ini sangat manipulatif?',
    back: 'Menyamar sebagai program yang tampak sah atau berguna (seperti game atau utilitas) untuk mengelabui pengguna agar menginstalnya.',
    hint: 'Terinspirasi dari legenda kuda kayu Yunani kuno.',
    explanation: 'Setelah diinstal, Trojan membuka pintu belakang (Backdoor) yang memungkinkan peretas mengendalikan sistem korban dari jarak jauh.',
    lessonUrl: '#/learn/3-b'
  },
  {
    id: 'fc-3-b-3',
    chapterId: '3',
    subchapterId: '3-b',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Jenis-Jenis Malware',
    front: 'Apa ancaman utama dari Ransomware dan bagaimana metode pemerasannya?',
    back: 'Mengenkripsi berkas korban dengan algoritma kriptografi kuat dan menuntut tebusan uang (biasanya aset kripto) untuk kunci dekripsi.',
    hint: 'Menyandera data korban dan memunculkan surat pemerasan di layar.',
    explanation: 'Membayar tebusan tidak menjamin kunci dekripsi diberikan. Satu-satunya proteksi paling andal terhadap ransomware adalah cadangan data (backup) berkala yang terisolasi.',
    lessonUrl: '#/learn/3-b'
  },
  {
    id: 'fc-3-b-4',
    chapterId: '3',
    subchapterId: '3-b',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Jenis-Jenis Malware',
    front: 'Apa itu "Spyware" dan "Keylogger", serta informasi apa yang mereka targetkan?',
    back: 'Spyware memantau aktivitas pengguna tanpa izin, sementara Keylogger merekam setiap ketukan keyboard termasuk kata sandi dan nomor kartu kredit.',
    hint: 'Memata-matai diam-diam di latar belakang sistem.',
    explanation: 'Keylogger dapat menyalin kredensial saat pengguna mengetik dan mengirimkannya ke server command-and-control (C2) milik penyerang.',
    lessonUrl: '#/learn/3-b'
  },
  {
    id: 'fc-3-c-1',
    chapterId: '3',
    subchapterId: '3-c',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Cara Penyebaran Malware',
    front: 'Apa teknik "Double Extension" yang sering dipakai penyerang untuk menyamarkan malware?',
    back: 'Memberi nama file seperti "Laporan.pdf.exe" dengan memanfaatkan fitur sistem operasi yang menyembunyikan ekstensi file umum.',
    hint: 'Tampak seperti PDF biasa padahal berkas eksekusi program.',
    explanation: 'Jika OS menyembunyikan ekstensi berkas, pengguna hanya melihat "Laporan.pdf" dengan ikon PDF palsu, padahal sebenarnya adalah executable berbahaya.',
    lessonUrl: '#/learn/3-c'
  },
  {
    id: 'fc-3-c-2',
    chapterId: '3',
    subchapterId: '3-c',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Cara Penyebaran Malware',
    front: 'Mengapa dokumen Word atau Excel dengan "Macro VBA" diwaspadai sebagai vektor malware?',
    back: 'Script Macro dapat mengeksekusi perintah sistem otomatis di PowerShell untuk mengunduh dan menginstal malware saat dokumen dibuka.',
    hint: 'Peringatan kuning "Enable Content / Enable Macros" di aplikasi perkantoran.',
    explanation: 'Penyerang sering menggunakan phishing dokumen tagihan palsu dan membujuk korban menekan tombol "Enable Macro" agar script berbahaya dapat berjalan.',
    lessonUrl: '#/learn/3-c'
  },
  {
    id: 'fc-3-c-3',
    chapterId: '3',
    subchapterId: '3-c',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Cara Penyebaran Malware',
    front: 'Apa itu serangan "Drive-by Download" saat menjelajahi web?',
    back: 'Malware yang terunduh dan terpasang otomatis ke komputer korban hanya dengan mengunjungi situs yang disusupi, tanpa klik unduh manual.',
    hint: 'Cukup membuka halaman web berbahaya atau iklan yang terinfeksi malvertising.',
    explanation: 'Serangan ini mengeksploitasi kerentanan pada peramban web (browser) atau plugin yang kedaluwarsa untuk mengeksekusi kode berbahaya.',
    lessonUrl: '#/learn/3-c'
  },
  {
    id: 'fc-3-d-1',
    chapterId: '3',
    subchapterId: '3-d',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Studi Kasus dan Contoh Nyata',
    front: 'Mengapa serangan ransomware "WannaCry" pada tahun 2017 mampu menyebar ke 150 negara dalam hitungan jam?',
    back: 'WannaCry menggabungkan ransomware dengan kemampuan Worm yang mengeksploitasi kerentanan SMBv1 EternalBlue pada sistem operasi Windows yang belum ditambal.',
    hint: 'Kombinasi ransomware penyandera data dengan daya tular worm jaringan.',
    explanation: 'WannaCry tidak butuh interaksi korban untuk menular antar-komputer di jaringan yang sama karena memanfaatkan celah keamanan protokol SMB jaringan.',
    lessonUrl: '#/learn/3-d'
  },
  {
    id: 'fc-3-d-2',
    chapterId: '3',
    subchapterId: '3-d',
    chapterTitle: 'Malware (Malicious Software)',
    subchapterTitle: 'Studi Kasus dan Contoh Nyata',
    front: 'Apa pelajaran keamanan terpenting dari studi kasus insiden malware industri "Stuxnet"?',
    back: 'Jaringan yang terisolasi dari internet (Air-Gapped) sekalipun tetap rentan disusupi melalui media penyimpanan fisik seperti USB flashdisk yang terinfeksi.',
    hint: 'Target fasilitas nuklir yang sama sekali tidak tersambung ke kabel internet.',
    explanation: 'Stuxnet membuktikan bahwa faktor manusia dan media fisik (USB) adalah vektor serangan krusial yang memerlukan kontrol akses perangkat keras yang ketat.',
    lessonUrl: '#/learn/3-d'
  },

  // ── BAB 4: Meningkatkan Keamanan Data dan Informasi ─────────
  {
    id: 'fc-4-a-1',
    chapterId: '4',
    subchapterId: '4-a',
    chapterTitle: 'Meningkatkan Keamanan Data dan Informasi',
    subchapterTitle: 'Prinsip Dasar Keamanan Data dan Informasi',
    front: 'Apa prinsip keamanan "Defense in Depth" (Pertahanan Berlapis)?',
    back: 'Menerapkan beberapa lapisan mekanisme pertahanan secara berurutan, sehingga jika satu lapisan jebol, lapisan lain tetap melindungi aset.',
    hint: 'Analoginya benteng bertembok ganda, parit air, dan pintu baja.',
    explanation: 'Contoh: Menggabungkan firewall, antivirus endpoint, autentikasi 2FA, enkripsi data, dan segmentasi jaringan untuk meminimalisasi risiko penyusupan tunggal.',
    lessonUrl: '#/learn/4-a'
  },
  {
    id: 'fc-4-a-2',
    chapterId: '4',
    subchapterId: '4-a',
    chapterTitle: 'Meningkatkan Keamanan Data dan Informasi',
    subchapterTitle: 'Prinsip Dasar Keamanan Data dan Informasi',
    front: 'Apa maksud dari prinsip "Least Privilege" (Hak Akses Minimum)?',
    back: 'Memberikan hak akses hanya sebatas yang mutlak diperlukan pengguna untuk menjalankan tugas pekerjaannya.',
    hint: 'Jangan beri akses Administrator pada akun yang hanya butuh mengetik dokumen.',
    explanation: 'Jika akun karyawan biasa berhasil diretas, penyerang tidak bisa langsung menguasai seluruh sistem karena akun tersebut tidak memiliki hak akses administrator.',
    lessonUrl: '#/learn/4-a'
  },
  {
    id: 'fc-4-a-3',
    chapterId: '4',
    subchapterId: '4-a',
    chapterTitle: 'Meningkatkan Keamanan Data dan Informasi',
    subchapterTitle: 'Prinsip Dasar Keamanan Data dan Informasi',
    front: 'Apa prinsip dasar arsitektur keamanan "Zero Trust"?',
    back: '"Never Trust, Always Verify" — Jangan percaya siapapun secara otomatis, verifikasi identitas dan keamanan perangkat di setiap permintaan akses.',
    hint: 'Tidak ada lagi konsep jaringan internal yang otomatis dianggap aman.',
    explanation: 'Zero Trust menganggap penyerang bisa saja sudah berada di dalam jaringan lokal, sehingga autentikasi ketat dan verifikasi berkala tetap wajib dijalankan di setiap koneksi.',
    lessonUrl: '#/learn/4-a'
  },
  {
    id: 'fc-4-b-1',
    chapterId: '4',
    subchapterId: '4-b',
    chapterTitle: 'Meningkatkan Keamanan Data dan Informasi',
    subchapterTitle: 'Teknik dan Strategi Penggunaan Data',
    front: 'Apa saja 3 faktor autentikasi utama dalam Multi-Factor Authentication (MFA)?',
    back: '1. Something you know (kata sandi/PIN). 2. Something you have (ponsel/kunci keamanan USB). 3. Something you are (sidik jari/pemindai wajah).',
    hint: 'Apa yang Anda ingat, apa yang Anda miliki, dan ciri fisik biometrik Anda.',
    explanation: 'MFA mewajibkan minimal dua faktor berbeda. Jika hanya memakai kata sandi dan PIN, itu bukan MFA karena keduanya termasuk kategori "something you know".',
    lessonUrl: '#/learn/4-b'
  },
  {
    id: 'fc-4-b-2',
    chapterId: '4',
    subchapterId: '4-b',
    chapterTitle: 'Meningkatkan Keamanan Data dan Informasi',
    subchapterTitle: 'Teknik dan Strategi Penggunaan Data',
    front: 'Jelaskan formula "Aturan Cadangan 3-2-1" (3-2-1 Backup Rule)!',
    back: 'Miliki minimal 3 salinan data, simpan pada 2 media penyimpanan berbeda, dan simpan 1 salinan di lokasi fisik/cloud terpisah (off-site).',
    hint: 'Tiga angka keramat strategi mitigasi bencana data.',
    explanation: 'Contoh: 1 data kerja di laptop, 1 salinan di harddisk eksternal di rumah, dan 1 salinan di cloud backup. Jika rumah terbakar atau terserang ransomware, data di cloud tetap selamat.',
    lessonUrl: '#/learn/4-b'
  },
  {
    id: 'fc-4-b-3',
    chapterId: '4',
    subchapterId: '4-b',
    chapterTitle: 'Meningkatkan Keamanan Data dan Informasi',
    subchapterTitle: 'Teknik dan Strategi Penggunaan Data',
    front: 'Apa perbedaan antara Enkripsi Simetris (Symmetric) dan Enkripsi Asimetris (Asymmetric)?',
    back: 'Enkripsi simetris memakai satu kunci rahasia yang sama untuk enkripsi dan dekripsi. Enkripsi asimetris memakai sepasang kunci: Kunci Publik (enkripsi) dan Kunci Privat (dekripsi).',
    hint: 'Kunci tunggal (AES) vs pasangan kunci publik-privat (RSA).',
    explanation: 'Enkripsi simetris cepat untuk data berukuran besar, sedangkan enkripsi asimetris ideal untuk pertukaran kunci aman dan tanda tangan digital di internet.',
    lessonUrl: '#/learn/4-b'
  },
  {
    id: 'fc-4-b-4',
    chapterId: '4',
    subchapterId: '4-b',
    chapterTitle: 'Meningkatkan Keamanan Data dan Informasi',
    subchapterTitle: 'Teknik dan Strategi Penggunaan Data',
    front: 'Mengapa penggunaan aplikasi Password Manager lebih aman dibanding mencatat atau mengingat kata sandi sendiri?',
    back: 'Password Manager dapat membuat kata sandi acak unik dan panjang untuk setiap situs, serta mengenkripsinya dengan standar AES-256 yang hanya bisa dibuka dengan Master Password.',
    hint: 'Mencegah kebiasaan buruk menggunakan satu kata sandi yang sama di semua akun.',
    explanation: 'Jika salah satu situs tempat Anda mendaftar mengalami kebocoran data, akun-akun Anda yang lain tetap aman karena tidak ada kata sandi yang dipakai berulang (credential reuse).',
    lessonUrl: '#/learn/4-b'
  }
];

/**
 * Returns all flashcards
 */
export function getAllFlashcards() {
  return FLASHCARDS_DATA;
}

/**
 * Returns flashcard by ID
 */
export function getFlashcardById(id) {
  return FLASHCARDS_DATA.find(card => card.id === id) || null;
}

/**
 * Returns flashcards filtered by chapter ID
 */
export function getFlashcardsByChapter(chapterId) {
  return FLASHCARDS_DATA.filter(card => card.chapterId === String(chapterId));
}

/**
 * Returns flashcards filtered by subchapter ID
 */
export function getFlashcardsBySubchapter(subchapterId) {
  return FLASHCARDS_DATA.filter(card => card.subchapterId === String(subchapterId));
}
