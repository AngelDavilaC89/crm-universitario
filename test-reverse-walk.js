const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

async function checkTransitions() {
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

    // Find the last row with data
    let lastRow = -1;
    for (let r = data.length - 1; r >= 1; r--) {
      if (data[r] && (data[r][0] || data[r][1])) {
        lastRow = r;
        break;
      }
    }

    console.log(`\n================== [${f.name}] ==================`);
    console.log(`Total rows in array: ${data.length}, Last row with data: ${lastRow + 1}`);

    // Walk backwards until we hit September (or non-October)
    let consecutiveNonOct = 0;
    let octoberRows = [];
    let stopRow = -1;

    for (let r = lastRow; r >= 1; r--) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
      const raw = data[r]?.[0];
      const fmt = ws[cellRef]?.w;
      const str = String(fmt || raw || '').trim();

      // Check if this row is September (e.g. starts with 9/ or contains /9/ or serial in Sept)
      let isSeptember = false;
      if (str.startsWith('9/') || str.includes('/9/26') || str.includes('/9/2026')) {
        isSeptember = true;
      } else if (typeof raw === 'number') {
        const dt = new Date(Math.round((raw - 25569) * 86400 * 1000));
        if (dt.getMonth() === 8 && dt.getFullYear() === 2026) isSeptember = true; // Month 8 is Sept
      }

      if (isSeptember) {
        stopRow = r;
        console.log(`Hit September at Row ${r + 1}: cellA="${str}" | raw=${raw} | name="${data[r]?.[1]}"`);
        break;
      }

      octoberRows.push({ row: r + 1, cellA: str, raw, name: data[r]?.[1], phone: data[r]?.[2] });
    }

    console.log(`Total October leads found walking backwards: ${octoberRows.length}`);
    console.log(`Earliest October row: ${octoberRows[octoberRows.length - 1]?.row} ("${octoberRows[octoberRows.length - 1]?.cellA}")`);
    console.log(`Latest October row: ${octoberRows[0]?.row} ("${octoberRows[0]?.cellA}")`);
  }
}

checkTransitions();
