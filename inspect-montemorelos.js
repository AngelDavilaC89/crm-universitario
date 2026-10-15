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

    const fileId = '1STilwMVlvwvkOTSXPNiB4s1uTCZskgAL';

    console.log("=== Checking File Metadata in Drive ===");
    const meta = await drive.files.get({ fileId, fields: 'id, name, mimeType' });
    console.log("File Name:", meta.data.name);
    console.log("MimeType:", meta.data.mimeType);

    // Let's also check Campus tab in CRM central doc
    if (process.env.GOOGLE_SPREADSHEET_ID) {
      console.log("\n=== Checking CRM Campus Catalog ===");
      try {
        const crmRes = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
          range: 'Campus!A1:C20',
        });
        console.log("Campus list in CRM:", crmRes.data.values);
      } catch (e) {
        console.log("Could not load Campus tab:", e.message);
      }
    }

    if (meta.data.mimeType === 'application/vnd.google-apps.spreadsheet') {
      console.log("\nIt is a native Google Spreadsheet! Fetching sheets metadata...");
      const ssMeta = await sheets.spreadsheets.get({ spreadsheetId: fileId });
      console.log("Sheets/Tabs in this file:");
      ssMeta.data.sheets.forEach(s => {
        console.log(`- Title: "${s.properties.title}", SheetId: ${s.properties.sheetId}`);
      });

      // Sample first tab or gid 180285327
      const targetSheet = ssMeta.data.sheets.find(s => s.properties.sheetId === 180285327) || ssMeta.data.sheets[0];
      console.log(`\nSampling sheet "${targetSheet.properties.title}"...`);
      const valuesRes = await sheets.spreadsheets.values.get({
        spreadsheetId: fileId,
        range: `'${targetSheet.properties.title}'!A1:Z10`,
      });
      console.log("First rows:", JSON.stringify(valuesRes.data.values, null, 2));
    } else {
      console.log("\nIt is an external binary file (e.g. XLSX). Downloading...");
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      const buffer = Buffer.from(response.data);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      console.log("Sheet names in XLSX:", workbook.SheetNames);
      
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true });
      console.log("Total rows:", data.length);
      console.log("Header (row 0):", data[0]);
      console.log("Row 1:", data[1]);
      console.log("Last row:", data[data.length - 1]);
    }
  } catch (error) {
    console.error("ERROR MESSAGE:", error.message);
    if (error.response && error.response.data) {
      console.error("RESPONSE DATA:", error.response.data);
    }
  }
}

run();
