const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

async function testTransition() {
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
    const ws = wb.Sheets[f.sheet] || wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

    let lastRow = -1;
    for (let r = data.length - 1; r >= 1; r--) {
      if (data[r] && (data[r][0] || data[r][1])) {
        lastRow = r;
        break;
      }
    }

    let endOfSeptRow = -1;
    for (let r = lastRow; r >= 1; r--) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
      const raw = data[r]?.[0];
      const fmt = ws[cellRef]?.w;
      const str = String(fmt || raw || '').trim();

      // Check if end of September (day 28-30 of month 9)
      const parts = str.split(/[\/\-]/).map(p => parseInt(p.trim()));
      let isEndOfSept = false;
      if (parts.length === 3) {
        if ((parts[0] === 9 && parts[1] >= 28 && parts[1] <= 31) || (parts[1] === 9 && parts[0] >= 28 && parts[0] <= 31)) {
          isEndOfSept = true;
        }
      } else if (typeof raw === 'number') {
        const dt = new Date(Math.round((raw - 25569) * 86400 * 1000));
        if (dt.getFullYear() === 2026 && dt.getMonth() === 8 && dt.getDate() >= 28) {
          isEndOfSept = true;
        }
      }

      if (isEndOfSept) {
        endOfSeptRow = r;
        console.log(`[${f.name}] End of September hit at row ${r + 1} (${str} | ${data[r]?.[1]})`);
        break;
      }
    }

    console.log(`[${f.name}] October starts at row ${endOfSeptRow + 2} and ends at row ${lastRow + 1}`);
  }
}

testTransition();
