# HANDOVER NONICS — Untuk Claude Baru

> Baca ini sebelum mulai. Jangan tanya ulang hal yang sudah dikunci.

---

## INSTRUKSI KOMUNIKASI (WAJIB)
- Selalu respond dalam **Bahasa Indonesia**
- Instruksi **satu langkah satu langkah** — tidak boleh dump banyak langkah sekaligus
- Non-teknis tapi decisive — langsung aksi, bukan penjelasan panjang
- Gunakan **single combined command**, bukan multiple separate commands
- Jangan minta maaf berulang — langsung fix
- Setiap perintah Claude Code diakhiri: **"setelah selesai commit dan push ke GitHub"** (kecuali kalau eksplisit bilang jangan commit)

---

## APA YANG SEDANG DIBANGUN

### Ekosistem NONICS
Bisnis COD online milik Donnie (Menhefari / @josephdelena). Ada beberapa CS yang handle order via Telegram.

### Sheetgram
Bot Python (Telethon) yang:
- Monitor 10+ grup Telegram (COD & TF)
- Grab data penjualan otomatis setiap 12 jam
- Tulis ke Google Sheets **"NONICS MANTAP"** (ID: `11OBF1gM6zDNbCBvH0L-_wyfjuL0gEMXH-AHpiDPesfA`)
- Deploy di Railway, auto-deploy dari GitHub

### NONICS Dashboard
Dashboard web Next.js + Tailwind yang baca data dari Google Sheets.
- Live di: https://nonics-dashboard.vercel.app
- Google OAuth dibatasi beberapa email
- Repo: `josephdelena/nonics-dashboard`
- Lokal: `~/Documents/workspace/nonics`

---

## KEPUTUSAN YANG SUDAH DIKUNCI (jangan dibahas ulang)

1. **Bot pakai Telegram user account session** (bukan bot token) via `TELEGRAM_SESSION` env var — ini disengaja
2. **Stack dashboard**: Next.js + Tailwind, deploy Vercel
3. **Google Sheets** sebagai database utama — bukan database lain
4. **Prefix KiriminAja**: `NNC-`
5. **Default berat & dimensi**: 1000g, 15x15x10cm
6. **Pengirim tersimpan** di BookingModal — tidak perlu setup ulang
7. **Bot jalan tiap 12 jam** (bukan 6 jam lagi)
8. **RTS hanya valid untuk order >= 3 hari** — order baru tidak bisa di-tag RTS

---

## REPO & INFRASTRUKTUR

| Komponen | Detail |
|---|---|
| Repo Sheetgram | `josephdelena/sheetgram` |
| Repo Dashboard | `josephdelena/nonics-dashboard` |
| Lokal Sheetgram | `~/Documents/workspace/nonics/nonics-tools/sheetgram` |
| Lokal Dashboard | `~/Documents/workspace/nonics` |
| Spreadsheet | "NONICS MANTAP" — ID: `11OBF1gM6zDNbCBvH0L-_wyfjuL0gEMXH-AHpiDPesfA` |
| Google Cloud | Project: `sheetgram-492014`, SA: `sheetgram-bot@sheetgram-492014.iam.gserviceaccount.com` |
| Hosting Bot | Railway (auto-deploy dari GitHub) |
| Hosting Dashboard | Vercel |

---

## STATE SEKARANG — APA YANG SUDAH SELESAI HARI INI

### Sheetgram (bot)
- ✅ Tab **EXCEL NONICS** — otomatis dibuat/update setiap bot run
- ✅ Kolom EXCEL NONICS: No, Opsi Penjemputan, Nama Penerima, Nomor Telepon, Alamat Penerima, Kabupaten Penerima, Kecamatan Penerima, Kode Pos Penerima, Order, Berat, P, L, T, Nilai Barang, Nilai COD, Jumlah Item, Catatan, Asuransi, Pembayaran, Kurir, kodepos_status, Resi (kolom N)
- ✅ Lookup kodepos dari `data/kodepos.xlsx` (6993 entries, Sheet1: Province/City/Subdistrict/ZIP)
- ✅ Extract kecamatan dari alamat (regex: Kec/kec/KEC/Kecamatan)
- ✅ Logic kurir: Jabodetabek + Jawa Barat = lion/REGPACK, selain itu = idx/00
- ✅ Tab **Meta** — summary kodepos kosong (jumlah + nomor order)
- ✅ Tab **RTS Blacklist** — customer yang pernah RTS, dicek setiap bot run
- ✅ Status: Sukses / RTS / DUPLIKAT / REPEAT RTS
- ✅ RTS hanya valid untuk order >= 3 hari
- ✅ Bot tidak overwrite baris yang kodepos_status sudah "ok" hasil edit manual

### Dashboard (nonics-dashboard)
- ✅ Tab Overview — KPI cards, chart COD vs TF, bar per grup, line trend harian
- ✅ Tab Performa CS
- ✅ Tab Produk Terlaku
- ✅ Tab Detail Orders — tabel lengkap dengan kolom: Tanggal, Grup, CS, Produk, Total, Customer, Alamat, Kode Pos, Kurir, Tipe, Status
- ✅ Filter: date picker, Semua Tipe, Semua Grup, Semua Status, tombol **Kodepos Kosong**
- ✅ Checkbox per baris + select all
- ✅ Action bar: edit status (Sukses/RTS/DUPLIKAT/REPEAT RTS) + Simpan
- ✅ **Warning card** "⚠️ X order kodepos kosong" — klik → modal list nomor order
- ✅ Modal kodepos kosong — tiap order bisa diklik → edit kodepos → update sheet → warning berkurang
- ✅ Tombol **"Kirim via KiriminAja"** di action bar saat order dipilih
- ✅ **BookingModal** — pilih pengirim (Nonics Makassar / Depok Store), dimensi editable, booking ke KiriminAja sandbox
- ✅ Resi (AWB/pickup_number) masuk ke kolom Resi di EXCEL NONICS

### Integrasi KiriminAja
- ✅ API sandbox terhubung (`https://api.kiriminaja.com/api/mitra`)
- ✅ API Key: `c91a6414b880a82e7ea342187cc258f878d28b66c4c6423b7869e3cc1d033217` (SANDBOX)
- ✅ Prefix: `NNC-` (sudah terdaftar di sandbox)
- ✅ Pengirim tersimpan:
  - **Nonics Makassar**: Jl. Perintis Kemerdekaan KM 12, HP: 081958718474, kec_id: 3596, lat: -5.1477, lng: 119.4327
  - **Depok Store**: Perumahan Palem Ganda Asri Jl. Kijang Raya A2/20 Kel. Meruyung, Limo Depok, HP: 081958718474, kec_id: 1583, lat: -6.3833, lng: 106.8167
- ✅ Auto lookup kecamatan_id penerima via KiriminAja API
- ✅ Auto fetch ongkir sebelum booking (fallback default Rp15.000)
- ✅ Normalisasi nomor HP (0812→62812, +62812→62812)
- ✅ Lion parcel butuh lat/lng — sudah ditambahkan
- ✅ Order yang kecamatan tidak ditemukan → di-skip, booking lanjut untuk order lain
- ✅ Hasil booking tampilkan AWB (XID-...) di modal

---

## YANG BELUM SELESAI / NEXT STEPS

### Prioritas tinggi:
1. **Test KiriminAja production** — ganti API key dari sandbox ke production, test real booking
2. **Fix kurir di booking** — kurir yang diedit user di tabel Detail Orders harus terbaca saat booking (sekarang masih ambil dari EXCEL NONICS, bukan dari edit user)
3. **Grafik tanggal ngaco** — sumbu X chart masih muncul "1/1" untuk data yang tanggalnya tidak valid

### Prioritas medium:
4. **Formatting EXCEL NONICS** — bot belum dirun ulang setelah fix formatting batchUpdate, lebar kolom belum auto-resize
5. **Run bot ulang** untuk tanggal hari ini dengan semua fix terbaru (RTS 3 hari, EXCEL NONICS, kurir logic)

### Planned (belum dimulai):
6. Notifikasi Telegram harian ke owner setelah bot selesai
7. Target harian per CS dengan progress bar
8. Rekap komisi/gaji CS bulanan

---

## KONTEKS PENTING YANG TIDAK OBVIOUS

### KiriminAja
- Service code: `idx` + type `00` (bukan `idexpress` atau `idlite`)
- Service code: `lion` + type `REGPACK`
- Lion **wajib** lat/lng pengirim — kalau tidak ada → error
- `shipping_cost` **wajib** minimal 1 — kalau ongkir gagal, default 15000
- `schedule` wajib diisi — auto-set besok jam 10:00
- Order_id format: `NNC-{epoch}{index}` — unik per batch
- Sandbox base URL: `https://api.kiriminaja.com/api/mitra`

### Google Sheets
- Rate limit 429 masih bisa muncul kalau terlalu banyak request bersamaan — bot sudah ada delay
- Tab "Rekap CS" jangan di-fetch sebagai data order — ini tab summary, bukan data
- EXCEL NONICS kolom Resi ada di kolom N (kolom ke-14)
- Tab Meta: baris 1 = header, baris 2 = total kosong, baris 3+ = nomor order kosong

### Bot Sheetgram
- Dua format pesan CS: Format A (kebanyakan grup) dan Format B (MEBI-ISHA)
- CS name normalisasi ke Title Case saat parse
- Matching RTS: primary by phone, fallback by nama
- Schedule: **tiap jam 0 dan 12** (2x sehari) — `schedule: "0,12"` di config.yaml
- Lookback: **720 jam (30 hari)** — bot selalu baca pesan 30 hari ke belakang, dedup otomatis by message_id
- `--date YYYY-MM-DD` untuk run spesifik tanggal
- `--once` untuk single run tanpa schedule
- Railway CLI: `railway run python3 -m bot.main --once --date 2026-04-09`

### Dashboard
- Data di-fetch langsung dari Google Sheets setiap request (tidak ada cache permanen)
- `parseDate` sudah difix — reject format invalid, validasi range year 2020-2100
- Kolom Kurir di tabel Detail Orders bisa diedit langsung — tapi belum tersambung ke BookingModal
- Warning card kodepos kosong baca dari tab **Meta** di spreadsheet — bukan real-time dari EXCEL NONICS langsung
- Google OAuth whitelist email: defikame@gmail.com + beberapa email lain (cek kode untuk lengkapnya)

### EXCEL NONICS — Append-Only Mode
- **Perubahan penting:** Sheetgram sekarang **append-only** — data tidak pernah dihapus
- Dedup by `message_id` (kolom M di setiap sheet) — record dengan message_id yang sama TIDAK akan di-append ulang
- Tab ini terus bertambah setiap bot run — akumulasi semua hari, bukan reset harian
- Kolom: No, Tanggal, Nama CS, Nama Produk, Ongkir, Harga Jual, Diskon, Total, Nama Customer, No WA, Alamat, Status, message_id (13 kolom)
- `lookback_hours` sekarang **720 jam (30 hari)** — bot baca pesan 30 hari ke belakang untuk catch up
- Google Sheets limit ~10 juta cells → estimasi aman **2-3 tahun** sebelum perlu rotate sheet baru
- Rekomendasi: setelah 1 tahun pemakaian, archive sheet lama ke `"NONICS MANTAP - ARCHIVE 2026"` dan buat sheet baru
- Bot file: `bot/sheets.py` (append_new_records), `bot/config.py`

### Hal yang sempat error dan sudah difix
- `whitespace-nowrap` di KpiCard.tsx — sudah difix
- Google Sheets 429 rate limit — sudah ada delay antar request
- `parseDate` timezone issue — sudah difix pakai local date
- Tab "Rekap CS" ikut di-query dan return corrupt data — sudah di-exclude
- BookingModal hang karena auto-lookup kecamatan saat modal buka — sudah difix, lookup hanya saat klik Kirim

---

## GRUP TELEGRAM YANG DIMONITOR

| Nama Grup | Tipe | Keterangan |
|---|---|---|
| SALMA-RINO COD | COD | |
| DINA-ERLIN COD | COD | |
| LINDA-PINOT-LIYA COD | COD | |
| MEBI-ISHA COD | COD | Format B (parser berbeda) |
| OKTA-HUSNA COD | COD | |
| SALMA-RINO TF | TF | |
| DINA-ERLIN TF | TF | |
| LINDA-PINOT-LIYA TF | TF | |
| MEBI-ISHA TF | TF | Format B |
| OKTA-HUSNA TF | TF | |
| Afelina COD | COD | Makassar |
| Afelina TF | TF | Makassar |
| Nonics & Depok Store RTS | RTS | chat_id: -365772284 — source file Excel RTS |

---

## PERTANYAAN TERBUKA

1. **Kapan switch ke KiriminAja production?** — perlu ganti API key di Vercel env vars
2. **UAT KiriminAja** — tim KiriminAja minta UAT sederhana sebelum production. Sudah siap?
3. **Alamat Nonics Makassar** — "Jl. Perintis Kemerdekaan KM 12" — betul atau perlu diganti?
4. **Sheetgram SaaS** — sudah sepakat jual recurring, tapi masalah onboarding Telegram (user session vs bot token) belum diputuskan. Opsi: refactor ke bot token untuk scalability
5. **Sheet rotation policy** — setelah ~2-3 tahun (estimasi 10 juta cells limit tercapai), perlu procedure untuk archive sheet lama dan buat sheet baru

---

## CARA RUN BOT MANUAL
```bash
cd ~/Documents/workspace/nonics/nonics-tools/sheetgram && railway run python3 -m bot.main --once --date 2026-04-09
```

---

*Handover dibuat: 9 April 2026*
*Update terakhir: 13 April 2026* (Append-only mode, lookback_hours 720, message_id dedup)
