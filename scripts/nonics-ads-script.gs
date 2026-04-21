/**
 * NONICS ADS DATA — Google Ads MCC Script
 * =========================================
 * CARA PASANG:
 *   1. Buka Google Ads MCC (akun manager)
 *   2. Tools & Settings → Bulk Actions → Scripts → New Script
 *   3. Paste seluruh isi file ini
 *   4. Isi konstanta SPREADSHEET_ID di bawah (dari URL Google Sheet)
 *   5. Klik Authorize → Allow akses Google Sheets
 *   6. Klik Run sekali untuk test manual & authorize
 *   7. Kembali ke daftar script → klik nama script → Frequency: Daily, jam 01:00
 *
 * TARGET SHEET:
 *   - Nama sheet: NONICS ADS DATA
 *   - Tab: ads_daily
 *   - Share editor ke service account dashboard (lihat checklist deploy)
 *
 * KOLOM OUTPUT (A-L):
 *   date | account_id | account_name | campaign_id | campaign_name |
 *   ad_group_id | ad_group_name | impressions | clicks | cost_idr |
 *   conversions | conversions_value
 */

// ============================================================
// ISI SPREADSHEET_ID DI BAWAH INI (ambil dari URL Google Sheet)
// Contoh: https://docs.google.com/spreadsheets/d/XXXXXXXX/edit
// ============================================================
var SPREADSHEET_ID = '';
// ============================================================

var DAYS_LOOKBACK = 90;

function main() {
  if (!SPREADSHEET_ID) {
    Logger.log('ERROR: SPREADSHEET_ID kosong. Isi dulu di baris konstanta.');
    return;
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ads_daily');
  if (!sheet) {
    sheet = ss.insertSheet('ads_daily');
  }

  // Clear existing data
  sheet.clearContents();

  // Write header
  var header = [
    'date', 'account_id', 'account_name',
    'campaign_id', 'campaign_name',
    'ad_group_id', 'ad_group_name',
    'impressions', 'clicks', 'cost_idr',
    'conversions', 'conversions_value'
  ];
  sheet.getRange(1, 1, 1, header.length).setValues([header]);

  // Date range: last DAYS_LOOKBACK days
  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS_LOOKBACK);
  var dateStr = formatDate(startDate) + ',' + formatDate(endDate);

  var rows = [];

  // Loop semua sub-account di MCC
  var accountIterator = AdsManagerApp.accounts().get();
  while (accountIterator.hasNext()) {
    var account = accountIterator.next();
    AdsManagerApp.select(account);

    var accountId = account.getCustomerId();
    var accountName = account.getName();
    Logger.log('Processing: ' + accountName + ' (' + accountId + ')');

    try {
      // Query GAQL — per hari per campaign per ad_group
      var query =
        'SELECT ' +
        '  segments.date, ' +
        '  customer.id, ' +
        '  campaign.id, ' +
        '  campaign.name, ' +
        '  ad_group.id, ' +
        '  ad_group.name, ' +
        '  metrics.impressions, ' +
        '  metrics.clicks, ' +
        '  metrics.cost_micros, ' +
        '  metrics.conversions, ' +
        '  metrics.conversions_value ' +
        'FROM ad_group ' +
        'WHERE segments.date BETWEEN \'' + formatDate(startDate) + '\' AND \'' + formatDate(endDate) + '\' ' +
        '  AND campaign.status != \'REMOVED\' ' +
        '  AND ad_group.status != \'REMOVED\' ' +
        'ORDER BY segments.date DESC';

      var reportIterator = AdsApp.search(query);
      while (reportIterator.hasNext()) {
        var row = reportIterator.next();
        var costMicros = parseInt(row.metrics.costMicros) || 0;
        var costIdr = costMicros / 1000000; // micros → rupiah

        rows.push([
          row.segments.date,
          accountId,
          accountName,
          row.campaign.id,
          row.campaign.name,
          row.adGroup.id,
          row.adGroup.name,
          parseInt(row.metrics.impressions) || 0,
          parseInt(row.metrics.clicks) || 0,
          costIdr,
          parseFloat(row.metrics.conversions) || 0,
          parseFloat(row.metrics.conversionsValue) || 0
        ]);
      }
    } catch (e) {
      Logger.log('Error pada akun ' + accountName + ': ' + e.message);
    }
  }

  // Batch write sekali (bukan row-by-row)
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
    Logger.log('Done. Total rows: ' + rows.length);
  } else {
    Logger.log('Tidak ada data ditemukan untuk rentang ' + dateStr);
  }
}

function formatDate(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}
