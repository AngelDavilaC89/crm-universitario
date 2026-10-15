const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const fileId = '1STilwMVlvwvkOTSXPNiB4s1uTCZskgAL';

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  const buffer = Buffer.from(response.data);
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  console.log("Workbook Sheets:", workbook.SheetNames);

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
    console.log(`\n=================== Sheet: "${name}" ===================`);
    console.log(`Total rows: ${data.length}`);
    if (data.length > 0) {
      console.log("Row 0:", data[0]?.slice(0, 8));
      if (data.length > 1) console.log("Row 1:", data[1]?.slice(0, 8));
      if (data.length > 2) console.log("Row 2:", data[2]?.slice(0, 8));
      
      // Let's find rows with recent dates or October 2026
      const validRows = data.filter(r => r && r.length > 2 && r[0]);
      console.log(`Non-empty rows: ${validRows.length}`);
      if (validRows.length > 0) {
        console.log("Last 3 rows sample:");
        validRows.slice(-3).forEach((r, idx) => {
          console.log(`  Sample ${idx}:`, r.slice(0, 10));
        });
      }
    }
  }
}

run();
