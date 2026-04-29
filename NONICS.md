# HANDOVER — NONICS
*Untuk Claude baru: baca ini sebelum mulai apapun*
*Update terakhir: 29 April 2026*

---

## 1. KONTEKS & CARA KOMUNIKASI

**Donnie** (defikame@gmail.com) — founder DIMENSI GRUP. Non-teknis tapi decisif.
Bahasa Indonesia, langsung, tanpa basa-basi. Satu langkah per respons. Semua perintah terminal digabung 1 command diakhiri 'setelah selesai commit dan push ke GitHub'.

---

## 2. STRUKTUR FOLDER (PENTING — sering salah)

- Repo dashboard SEBENARNYA: ~/Documents/workspace/nonics/SALES NONICS/ → remote josephdelena/nonics-dashboard
- Repo sheetgram: ~/Documents/workspace/nonics/SALES NONICS/nonics-tools/sheetgram/ → remote josephdelena/sheetgram
- Folder root ~/Documents/workspace/nonics/ adalah wrapper lokal TANPA remote — jangan commit di sini

---

## 3. ARSITEKTUR SAAT INI

Telegram grup CS → Sheetgram bot (VPS Jagoan Hosting Nebula, IP 103.157.97.31, systemd Restart=always, APScheduler internal tiap jam, lookback 3 jam) → Google Sheet 'NONICS MANTAP' (ID: 11OBF1gM6zDNbCBvH0L-_wyfjuL0gEMXH-AHpiDPesfA) → Dashboard Next.js nonics.online (custom domain, Vercel) → KiriminAja API (sandbox) → cetak label → scan barcode → update status.

Paralel: Google Ads MCC → Apps Script daily → Sheet 'NONICS ADS DATA' (ID: 14oDFpTGtMzfUUcZ6tAt4fL02RtLXxGzUq8wF4Di7zAs) → tab /ads di dashboard.

VPS detail: Ubuntu 22.04, 2 vCPU, 2GB RAM, path /opt/sheetgram, service file /etc/systemd/system/sheetgram.service, deploy key SSH read-only repo sheetgram (ID 149303580). Railway service stopped permanent.

---

## 4. STATUS KOMPONEN

### A. Sheetgram Bot
- Runtime: VPS Jagoan Hosting Nebula (pindah dari Railway 22 Apr 2026), systemd Restart=always
- Cron: tiap jam (APScheduler internal), lookback 3 jam, dedup by message_id, append-only
- Bug kodepos sudah di-fix (disambiguation kabupaten + format tanpa spasi)
- Bug Afelina COD RESOLVED: 'mergeCells over filtered row' → _try_merge_separator catch APIError, fallback plain row (commit 3eb7400)
- Bug excel_nonics destructive clear RESOLVED: append+dedup by (no_hp+tanggal) default, flag --wipe-excel-nonics untuk rebuild (commit 5f4a738)
- Bug session Telegram konflik RESOLVED: 1 IP permanen VPS = tidak ada multiple instance
- Data: Apr 20/21/22 semua ada di EXCEL NONICS (712 data rows verified), 361 records Apr 21 di-backfill

### B. Dashboard nonics.online
- Domain custom aktif (dari Namecheap → Vercel), SSL OK, Google OAuth redirect sudah di-update untuk nonics.online + www
- Total Orders & Gross Sales sekarang COD+TF (bukan COD-only): 8.449 orders, Rp 1.074.215.200
- Tab /ads aktif: Total Spend, Klik, CTR, Konversi, Conv Rate, CPA, ROAS + breakdown per campaign expandable per ad_group
- Bug ADS_SPREADSHEET_ID build-time inline sudah di-fix (read di runtime function body)

### D. The Watchtower (AI Monitoring Agent)
- Tagline: "See everything. Alert on what matters. Act when needed." — built by DIMENSI Labs
- Stack: n8n (orchestrator) + OpenAI GPT-4.1-mini (decision brain) + Google Sheets API + VPS systemd + SSH + Telegram Bot API
- Runtime: podman container di VPS Jagoan Hosting (103.157.97.31), akses via SSH tunnel ke port 5678
- Workflow 1 — **Sheetgram Monitor Agent** (tiap 15 menit): cek touchfile `/tmp/sheetgram_last_write`, scrape service log, kirim ke GPT → decisions: `restart_bot` / `retry_operation` / `send_alert` / `ignore`. Cooldown 15 menit anti crash-loop restart.
- Workflow 2 — **Sheetgram Watchdog** (tiap 5 menit): restart n8n kalau heartbeat Watchtower stale >20 menit
- Alert conditions: service mati → auto-restart, data stuck >2 jam → alert, error flood ≥5 dalam 15 menit → alert, deteksi `--wipe` command → alert HIGH PRIORITY
- Alert channel: grup Telegram "KA Advertisers" via @nonicsbot
- Credentials disimpan di n8n vault: SSH password, Google Sheets OAuth2, OpenAI API key, Telegram bot token
- Biaya: ±Rp 43.000/bulan (OpenAI API GPT-4.1-mini usage)

### E. Trace (Address Intelligence Agent)
- Tagline: "Every address, decoded." — built by DIMENSI Labs
- Purpose: parse pesan closing CS jadi JSON terstruktur (nama, hp, alamat, kel, kec, kab/kota, prov, kodepos, produk, harga, ongkir, total)
- Stack hybrid: GPT-4o-mini (primary, ~57%) + Claude Haiku 4.5 (fallback ~43%) + wilayah_id.json validator
- Runtime: VPS Jagoan Hosting (103.157.97.31), integrated ke /opt/sheetgram, paralel parser existing
- Deploy: 29 April 2026 10:22 WIB, branch phase3-trace (BELUM merge ke main)
- Mode saat ini: SHADOW (log-only ke /opt/sheetgram/bot/trace/trace_shadow.db, ga sentuh Sheet, ga alert CS)
- Test offline: 10/10 PASS (5 few-shot real + 5 sampel CS Liya/Mebi/Rino/Salma)
- Auto-normalize working: "Karwaci"→"Karawaci", "Sei Beduk"→"Sungai Beduk", typo CS auto-correct
- Cost estimate: ~Rp 260rb/bulan @ 500 order/hari (49% fallback rate dari shadow real)
- Learning loop: SQLite trace_corrections + lookup_patterns table (stub, full implementation Phase 3.5)
- API keys: OPENAI_API_KEY + ANTHROPIC_API_KEY di /opt/sheetgram/.env
- Next: 7 hari evaluasi shadow mode → switch over kalau akurasi ≥95%

### C. Google Ads integration
- Script: scripts/nonics-ads-script.gs sudah jalan di MCC defikame@gmail.com (akun 'Dimensi 1', ID 910-032-5925)
- Data: 2.569 rows (21 Jan – 21 Apr 2026)
- Daily schedule 01:00 di MCC BELUM di-set user — pending action

---

## 5. DECISIONS LOCKED

- Domain produksi: nonics.online (keep nonics-dashboard.vercel.app sebagai fallback, belum di-redirect)
- Dashboard Total Orders = COD + TF
- Cron Sheetgram tiap jam + lookback 3 jam (naik dari 2x/hari 720 jam)
- **Sheetgram runtime: VPS Jagoan Hosting Nebula** — Railway stopped permanent, JANGAN reactivate
- Aturan operasional Sheetgram wajib via SSH VPS: JANGAN run python3 -m bot.main dari laptop lokal (session konflik), test/backfill WAJIB systemctl stop dulu sebelum manual run
- excel_nonics: append+dedup default, BUKAN wipe. Gunakan --wipe-excel-nonics hanya untuk rebuild dari nol
- sheets.py: handle filtered rows gracefully (try/except mergeCells, fallback plain separator)
- Ads integration pakai Google Apps Script (pattern Lymont), bukan Google Ads API
- **Monitoring stack: n8n + GPT-4.1-mini** — JANGAN ganti ke UptimeRobot (sudah digantikan The Watchtower). Semua credentials monitoring di n8n vault, bukan .env.
- Touchfile `/tmp/sheetgram_last_write` adalah sinyal utama monitoring — Sheetgram menyentuh file ini setiap successful sheet write, Watchtower membaca staleness-nya
- Phase 3 (Address Validator) v1 GAGAL 28 Apr (rule-based + alert palsu massal). v2 pakai LLM agent (Trace) per keputusan Donnie sejak awal.
- Trace stack: GPT-4o-mini happy path + Haiku 4.5 fallback. JANGAN downgrade ke pure GPT-4o-mini (akurasi turun di edge case lokal). JANGAN upgrade ke pure Haiku (cost ga worth).
- wilayah_id.json (1.3MB) di /opt/sheetgram/bot/data/ — JANGAN delete, validator depend ini.
- Branch phase3-trace JANGAN merge ke main sampai shadow evaluasi 7 hari clear.

---

## 6. BACKLOG

1. **Ganti root password VPS** — password lama (Valdea123,./) sudah exposed di chat, wajib ganti secepatnya
2. ~~Setup UptimeRobot + Telegram notifier~~ → **DONE: The Watchtower deployed 23 Apr 2026**
3. Set schedule daily Google Ads script di MCC
4. Remove filter manual di tab AFELINA COD di Google Sheets (cleanup trivial)
5. Redirect nonics-dashboard.vercel.app → nonics.online (opsional)
6. Kolom STATUS di sheet (PENDING/KIRIM/CANCEL) untuk flow fulfillment
7. Web app /scan barcode untuk update status KIRIM
8. Daily report Trace ke grup KA Advertisers via @nonicsbot (rencana implement next session)
9. Evaluasi shadow mode 7 hari berturut-turut → switch over kalau akurasi ≥95%
10. Phase 3.5: full learning loop (auto-promote pattern ke lookup_table.json setelah 10x koreksi konsisten)
11. Disk space monitoring trace_shadow.db (rotasi monthly nanti)

---

## 7. BACKUP TAGS

- josephdelena/sheetgram: backup-before-ads-20260421
- josephdelena/nonics-dashboard: backup-before-ads-20260421
- josephdelena/sheetgram commit sebelum migrasi VPS: dd22b51 (pre-VPS, Railway era)
- josephdelena/sheetgram commit fix excel_nonics: 5f4a738
- josephdelena/sheetgram commit fix filtered rows: 3eb7400

---

## 9. LESSONS 22-28 APRIL 2026

- **Gejala "bot ngadat" berulang 20 hari = masalah infra, bukan bug aplikasi.** Railway restart container saat deploy → spawn multiple instance → session Telegram konflik (AuthKeyDuplicatedError). VPS dengan 1 IP permanen + systemd = solusi permanen untuk kelas masalah ini.
- **Destructive clear() di pipeline periodik = anti-pattern.** Setiap `ws.clear()` di job yang jalan tiap jam akan wipe data historical. Selalu append+dedup untuk data tabular yang diakumulasi.
- **Google Sheets API mergeCells sensitif terhadap state sheet.** Filter aktif → mergeCells 400 error → seluruh batch gagal → data hilang. Wrap semua request yang bisa fail dengan try/except + fallback non-destructive.
- **Jangan klaim "selesai" tanpa verify observable output.** Cek row count di sheet, log line spesifik, atau screenshot dashboard — jangan asumsi dari success response API saja.
- **Few-shot examples WAJIB pakai data real, bukan placeholder fiktif.** 28 Apr Phase 3 v1 gagal karena rule-based parsing. 29 Apr build Trace (LLM agent), CC awalnya bikin few-shot fiktif (Bekasi/Bandung/Semarang) padahal pesan asli Pamekasan/Bandung/Depok. Hasil: LLM "halusinasi" output yang sebenarnya bukan halusinasi tapi mirror fiktif input. Lesson: kalau pakai LLM untuk task domain-specific, training data (few-shot) harus dari sample real production, bukan synthetic.
- **Validator strict + warning flag lebih baik dari validator dengan tolerance.** Mebi68 total mismatch (CS salah hitung 140rb vs 139rb seharusnya). Pilihan: pakai tolerance ±1000 (data lolos diam-diam) atau strict + warning (data tetap masuk, audit trail tetap ada). Pilih strict + warning — long-term lebih sehat untuk debugging dan QA CS.
- **Donnie's decision dari awal: agentic, BUKAN rule-based.** Dipush back oleh Phase 3 v1 implementer, akhirnya gagal. Lesson untuk AI/CC future: kalau user non-teknis tapi decisif kasih architecture call dari awal, jangan argue kecuali ada concrete reason. User sering punya konteks bisnis yang AI ga punya.

---

## 8. QUICK REFERENCE

Domain: nonics.online (custom) — fallback nonics-dashboard.vercel.app
Sheet NONICS MANTAP: 11OBF1gM6zDNbCBvH0L-_wyfjuL0gEMXH-AHpiDPesfA
Sheet NONICS ADS DATA: 14oDFpTGtMzfUUcZ6tAt4fL02RtLXxGzUq8wF4Di7zAs
Service account: sheetgram-bot@sheetgram-492014.iam.gserviceaccount.com
Admin email: defikame@gmail.com
Google Ads MCC: Dimensi 1 (910-032-5925)
Supabase: xdbvyomornsiwvkplved (DIMENSI ORG)
KiriminAja: sandbox active, prefix NNC-
n8n Watchtower: http://103.157.97.31:5678 (via SSH tunnel, port-forward dulu sebelum akses)
Telegram alert bot: @nonicsbot → grup "KA Advertisers"
Trace shadow DB: /opt/sheetgram/bot/trace/trace_shadow.db (SQLite)
Wilayah dataset: /opt/sheetgram/bot/data/wilayah_id.json (1.3MB, restore from repo)
Trace branch: phase3-trace (commit terakhir bc32956 — shadow.py + main.py integrated)
Cek shadow data: ssh root@103.157.97.31 "sqlite3 /opt/sheetgram/bot/trace/trace_shadow.db 'SELECT model_used, confidence, COUNT(*) FROM shadow_parses WHERE date(timestamp)=date(\"now\") GROUP BY model_used, confidence;'"
