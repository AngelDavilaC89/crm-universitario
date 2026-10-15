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
  const sheet = workbook.Sheets['Brenda Caballero'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  console.log("Header (row 1):", data[1]);

  // Check last 20 rows
  const validRows = data.filter(r => r && r.length > 2 && r[0]);
  console.log("\nLast 20 rows with dates:");
  validRows.slice(-20).forEach((r, idx) => {
    let dateStr = r[0];
    if (typeof r[0] === 'number') {
      const d = new Date(Math.round((r[0] - 25569) * 86400 * 1000));
      dateStr = `${r[0]} -> ${d.toISOString().slice(0, 10)}`;
    }
    console.log(`[${idx}] Date: ${dateStr} | Name: ${r[1]} | Phone: ${r[2]} | Email: ${r[3]} | Campus: ${r[4]} | Career: ${r[5]} | Medium: ${r[8]} | Adv: ${r[9]}`);
  });
}

run();
