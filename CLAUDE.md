# CLAUDE.md — Nonics Dashboard & Fulfillment
*~/Documents/workspace/nonics/SALES NONICS/*
*Last updated: April 2026*

> Project toko online Nonics — terpisah dari DIMENSI Labs dan JSM.
> Sheetgram logic: append-only, TIDAK PERNAH clear+rewrite.

---

## SISTEM

```
Telegram grup CS → Sheetgram bot (Railway) → Google Sheets → Dashboard Vercel → KiriminAja → Cetak label → Scan → KIRIM
```

## KOMPONEN

**Dashboard**
- URL: https://nonics-dashboard.vercel.app
- Stack: Next.js + Google Sheets API
- Folder: ~/Documents/workspace/nonics/SALES NONICS/
- Deploy: `vercel --prod` dari folder ini

**Sheetgram Bot**
- Folder: ~/Documents/workspace/nonics/SALES NONICS/nonics-tools/sheetgram/
- Repo: github.com/josephdelena/sheetgram
- Platform: Railway (ada masalah env var limit — solusi permanen: pindah VPS)
- Cron: 00:00 & 12:00 WIB, lookback 720 jam
- Logic: append-only berdasarkan message_id

**Google Sheets**
- Sheet ID: `11OBF1gM6zDNbCBvH0L-_wyfjuL0gEMXH-AHpiDPesfA`
- Tab COD: SALMA-RINO, DINA-ERLIN, LINDA-PINOT-LIYA, MEBI-ISHA, OKTA-HUSNA, AFELINA
- Tab TF: sama, suffix TF
- Jangan sentuh: Dashboard, Rekap CS, Top Produk, EXCEL NONICS, Meta, RTS Blacklist

**Supabase:** shared `xdbvyomornsiwvkplved`, tabel `nonics_config`

## STRUKTUR KOLOM TAB COD

```
A=No, B=Tanggal, C=Nama CS, D=Produk, E=Ongkir, F=No HP,
G=Harga Jual, H=Total, I=Alamat, J=Kecamatan, K=Kabupaten, L=Kode Pos, M=message_id
```

## ⚠️ CRITICAL: DATE HEADER ROWS

Setiap tanggal baru ada baris header di sheet (col A = tanggal, col B = kosong).
**SETIAP script yang menyentuh sheet WAJIB skip baris dengan col B kosong.**
`if r[1].strip() == '': continue` — sudah 3x kacau karena ini.

## KEPUTUSAN DIKUNCI

- Stack dashboard: Next.js + Google Sheets API — tidak diganti
- Sheetgram: append-only, TIDAK PERNAH clear+rewrite
- Filter dashboard: COD only untuk totalOrders dan grossRevenue
- Status fulfillment: PENDING (default) / KIRIM / CANCEL
- Nama CS canonical: Erlin, Husna, Linda, Dina, Salma, Rino, Isha, Mebi, Oktaviani, Liya, Ekha
- Rekap CS diisi oleh dashboard.py di Sheetgram — bukan formula sheet
- Admin: defikame@gmail.com

## STATUS SEKARANG (14 April 2026)

✅ Dashboard live, filter COD beres, row limit 5000
✅ Tab /robstark untuk config API KiriminAja
✅ Tabel nonics_config di Supabase
✅ Data bersih ~5047 COD orders

**Yang BELUM ada:**
- Logic tombol "Kirim via KiriminAja" (belum functional)
- Kolom STATUS di sheet (PENDING/KIRIM/CANCEL)
- Web app scan barcode (/scan)
- Resi dari KiriminAja ke sheet
- Fix Railway env var limit

**Bug pending:** Chart "semua hari" mulai dari 6/4 — harusnya dari tanggal pertama di sheet

## LANGKAH BERIKUTNYA

1. Input API key KiriminAja di /robstark → test koneksi
2. Build logic tombol "Kirim via KiriminAja"
3. Auto-simpan resi ke sheet
4. Tambah kolom STATUS di tab COD
5. Buat /scan — scan resi → update STATUS
6. Pindah Sheetgram ke VPS (30-60 menit)

## ALAT FISIK

- Label printer: Xprinter XP-420B
- Barcode scanner: Honeywell Voyager 1200g (USB, output seperti keyboard)
