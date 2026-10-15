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

  console.log("Checking cells around rows 1752 to 1772 in Brenda Caballero:");
  for (let r = 1750; r <= 1772; r++) {
    const cellA = sheet[`A${r}`];
    const cellB = sheet[`B${r}`];
    const cellC = sheet[`C${r}`];
    const cellD = sheet[`D${r}`];
    const cellF = sheet[`F${r}`];
    const cellL = sheet[`L${r}`];
    if (!cellA && !cellB) continue;
    console.log(`Row ${r}: A.v=${cellA?.v}, A.w="${cellA?.w}", A.t=${cellA?.t} | Name=${cellB?.v} | Tel=${cellC?.v} | Email=${cellD?.v} | Carrera=${cellF?.v}`);
  }
}

run();
