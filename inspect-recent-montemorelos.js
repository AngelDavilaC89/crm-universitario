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

  console.log("Analyzing all rows from 1700 to end:");
  for (let i = 1700; i < data.length; i++) {
    const r = data[i];
    if (!r || !r[0]) continue;
    let d = r[0];
    let dParsed = '';
    if (typeof d === 'number') {
      const dt = new Date(Math.round((d - 25569) * 86400 * 1000));
      dParsed = dt.toISOString().slice(0, 10);
    } else {
      dParsed = String(d);
    }
    console.log(`Row ${i}: raw=${d} (${dParsed}) | Name=${r[1]} | Phone=${r[2]} | Email=${r[3]} | Career=${r[5]}`);
  }
}

run();
