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

  const response = await drive.files.get(
    { fileId: '1roghd1regvcNS2T06cO31vG_vQ4fUKtt', alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  const buffer = Buffer.from(response.data);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, cellDates: true });
  
  console.log("Last 5 valid rows dump:");
  const validRows = data.filter(r => r && r[1]);
  for (let i = validRows.length - 5; i < validRows.length; i++) {
    const row = validRows[i];
    console.log(`Row ${i}:`);
    console.log(`  0 (Fecha):`, row[0]);
    console.log(`  1 (Nombre):`, row[1]);
    console.log(`  2 (Celular):`, row[2]);
    console.log(`  3 (Email?):`, row[3]);
    console.log(`  4 (Campus?):`, row[4]);
    console.log(`  5 (Carrera?):`, row[5]);
    console.log(`  6 (G?):`, row[6]);
    console.log(`  7 (H?):`, row[7]);
    console.log(`  8 (I?):`, row[8]);
    console.log(`  9 (J?):`, row[9]);
    console.log(`  10 (Comentario):`, row[10]);
  }
}
run();
