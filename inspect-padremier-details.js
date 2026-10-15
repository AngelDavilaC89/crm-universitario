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
  const fileId = '1Y4I6ranofhzrVTcXfReNVta4_YbuGmQO';

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  const buffer = Buffer.from(response.data);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets['KAREN VILLARREAL'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  console.log("Full Header (Row 1):");
  data[1].forEach((col, idx) => {
    console.log(`Col ${idx} (${String.fromCharCode(65 + idx)}): "${col}"`);
  });

  console.log("\nLast 25 rows with data:");
  const validRows = data.map((r, i) => ({ r, i })).filter(item => item.r && item.r.length > 2 && item.r[0]);
  validRows.slice(-25).forEach(({ r, i }) => {
    const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
    const fmt = sheet[cellRef]?.w;
    console.log(`[Row ${i + 1}] rawDate: ${r[0]} | fmtDate: "${fmt}" | Name: "${r[1]}" | Tel: "${r[2]}" | Mail: "${r[3]}"`);
    console.log(`          Row dump:`, r.slice(0, 12));
  });
}

run();
