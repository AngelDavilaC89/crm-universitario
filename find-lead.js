const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

async function findLead() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const files = [
    { name: 'Eloy Cavazos', id: '1roghd1regvcNS2T06cO31vG_vQ4fUKtt', sheet: '' },
    { name: 'Montemorelos', id: '1STilwMVlvwvkOTSXPNiB4s1uTCZskgAL', sheet: 'Brenda Caballero' },
    { name: 'Padre Mier', id: '1Y4I6ranofhzrVTcXfReNVta4_YbuGmQO', sheet: 'KAREN VILLARREAL' }
  ];

  for (const f of files) {
    const res = await drive.files.get({ fileId: f.id, alt: 'media' }, { responseType: 'arraybuffer' });
    const wb = XLSX.read(Buffer.from(res.data), { type: 'buffer' });
    for (const sName of wb.SheetNames) {
      const ws = wb.Sheets[sName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
      for (let r = 0; r < data.length; r++) {
        const rowStr = JSON.stringify(data[r] || '');
        if (rowStr.toLowerCase().includes('maría guadalupe gonzález') || rowStr.toLowerCase().includes('guadalupe gonzalez uribe') || rowStr.toLowerCase().includes('gonzález uribe')) {
          console.log(`FOUND in [${f.name} -> Sheet "${sName}"] at Row ${r + 1}:`);
          console.log(`  Raw row:`, data[r]);
          console.log(`  Cell A:`, ws['A' + (r + 1)]);
          console.log(`  Surrounding rows:`);
          for (let k = Math.max(0, r - 5); k <= Math.min(data.length - 1, r + 5); k++) {
            console.log(`    Row ${k + 1}: cellA=${ws['A' + (k + 1)]?.w || ws['A' + (k + 1)]?.v} | Name=${data[k]?.[1] || data[k]?.[0]}`);
          }
        }
      }
    }
  }
}

findLead();
