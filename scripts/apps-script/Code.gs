/**
 * Google Apps Script Web App — receives leads from the ROI calculator and
 * appends them to a Google Sheet.
 *
 * SETUP
 * 1. Create a Google Sheet. Open Extensions → Apps Script.
 * 2. Paste this file in as Code.gs.
 * 3. Run `setupHeaders` once to create the header row.
 * 4. Deploy → New deployment → type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the Web app URL into GOOGLE_SHEETS_WEBHOOK_URL in your .env.
 *
 * The app POSTs JSON of shape:
 *   { slug, lead: {name,email,company}, inputs, metrics:[{key,label,formatted}],
 *     utm: {source,medium,campaign,referrer,...}, submittedAt }
 */

var HEADERS = [
  "Submitted At",
  "Calculator",
  "Name",
  "Email",
  "Company",
  "Inputs",
  "Results",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "Referrer",
];

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.clear();
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    var lead = data.lead || {};
    var utm = data.utm || {};
    var inputs = data.inputs || {};
    var results = {};
    (data.metrics || []).forEach(function (metric) {
      results[metric.key] = metric.formatted;
    });

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.slug || "",
      lead.name || "",
      lead.email || "",
      lead.company || "",
      JSON.stringify(inputs),
      JSON.stringify(results),
      utm.source || "",
      utm.medium || "",
      utm.campaign || "",
      utm.referrer || "",
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
