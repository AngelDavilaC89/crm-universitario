const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ],
    });

    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    const fileId = '1Y4I6ranofhzrVTcXfReNVta4_YbuGmQO';

    console.log("=== Checking File Metadata in Drive for Padre Mier ===");
    const meta = await drive.files.get({ fileId, fields: 'id, name, mimeType' });
    console.log("File Name:", meta.data.name);
    console.log("MimeType:", meta.data.mimeType);

    if (meta.data.mimeType === 'application/vnd.google-apps.spreadsheet') {
      console.log("\nIt is a native Google Spreadsheet! Fetching sheets metadata...");
      const ssMeta = await sheets.spreadsheets.get({ spreadsheetId: fileId });
      console.log("Sheets/Tabs in this file:");
      ssMeta.data.sheets.forEach(s => {
        console.log(`- Title: "${s.properties.title}", SheetId: ${s.properties.sheetId}`);
      });

      const targetSheet = ssMeta.data.sheets.find(s => s.properties.sheetId === 264707419) || ssMeta.data.sheets[0];
      console.log(`\nSampling sheet "${targetSheet.properties.title}" (gid: ${targetSheet.properties.sheetId})...`);
      const valuesRes = await sheets.spreadsheets.values.get({
        spreadsheetId: fileId,
        range: `'${targetSheet.properties.title}'!A1:Z20`,
      });
      console.log("First rows (0 to 5):");
      valuesRes.data.values?.slice(0, 5).forEach((r, i) => console.log(`Row ${i}:`, r));
    } else {
      console.log("\nIt is an external binary file (e.g. XLSX). Downloading...");
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      const buffer = Buffer.from(response.data);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      console.log("Sheet names in XLSX:", workbook.SheetNames);
      
      for (const name of workbook.SheetNames) {
        console.log(`\n--- Sheet "${name}" ---`);
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
        console.log(`Total rows: ${data.length}`);
        if (data.length > 0) {
          console.log("Row 0:", data[0]?.slice(0, 10));
          console.log("Row 1:", data[1]?.slice(0, 10));
          console.log("Row 2:", data[2]?.slice(0, 10));
        }
      }
    }
  } catch (error) {
    console.error("ERROR MESSAGE:", error.message);
    if (error.response && error.response.data) {
      console.error("RESPONSE DATA:", error.response.data);
    }
  }
}

run();
