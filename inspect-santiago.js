const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

async function inspectSantiago() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });
  const fileId = '11oWyQyOlCtqSKr5xFQqf1f0TqZp-hicq';

  try {
    const meta = await drive.files.get({ fileId, fields: 'id, name, mimeType' });
    console.log('File metadata:', meta.data);

    // Also get sheet metadata using sheets API to check gid 344072400
    if (meta.data.mimeType === 'application/vnd.google-apps.spreadsheet') {
      const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: fileId });
      console.log('Google Spreadsheet Tabs:');
      for (const s of sheetMeta.data.sheets) {
        console.log(`  Title: "${s.properties.title}", sheetId: ${s.properties.sheetId}`);
      }
    }

    let buffer;
    if (meta.data.mimeType === 'application/vnd.google-apps.spreadsheet') {
      const res = await drive.files.export(
        { fileId, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { responseType: 'arraybuffer' }
      );
      buffer = Buffer.from(res.data);
    } else {
      const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
      buffer = Buffer.from(res.data);
    }

    const wb = XLSX.read(buffer, { type: 'buffer' });
    console.log('\nXLSX Sheet names:', wb.SheetNames);

    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
      console.log(`\nSheet: "${name}" has ${data.length} rows`);
      for (let r = 0; r < Math.min(5, data.length); r++) {
        console.log(`  Row ${r}:`, (data[r] || []).slice(0, 12));
      }
    }
  } catch (err) {
    console.error('Error accessing Santiago:', err.message);
  }
}

inspectSantiago();
