const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

async function inspectTail() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const fileId = '11oWyQyOlCtqSKr5xFQqf1f0TqZp-hicq';
  const sheetName = 'Janeth Villalon';

  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
  const wb = XLSX.read(Buffer.from(res.data), { type: 'buffer' });
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

  console.log(`Total rows in ${sheetName}:`, data.length);

  // Find last non-empty row
  let lastRow = -1;
  for (let r = data.length - 1; r >= 1; r--) {
    if (data[r] && (data[r][0] || data[r][1])) {
      lastRow = r;
      break;
    }
  }
  console.log('Last non-empty row:', lastRow, `(Excel row ${lastRow + 1})`);

  console.log('\n--- LAST 30 ROWS ---');
  for (let r = Math.max(1, lastRow - 30); r <= lastRow; r++) {
    const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
    const fmt = ws[cellRef]?.w;
    const raw = data[r]?.[0];
    const dt = typeof raw === 'number' ? new Date(Math.round((raw - 25569) * 86400 * 1000)).toISOString().slice(0, 10) : '';
    console.log(`Row ${r + 1}: raw=${raw} fmt="${fmt}" dt=${dt} | Name: "${data[r]?.[1]}" | Cel: "${data[r]?.[2]}"`);
  }

  // Let's test our dynamic cutoff logic on Santiago!
  const now = new Date();
  const targetMonth = now.getMonth() + 1; // 10
  const targetYear = now.getFullYear();   // 2026
  const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
  const prevYear = targetMonth === 1 ? targetYear - 1 : targetYear;

  let currentMonthStartIndex = 1;
  for (let r = lastRow; r >= 1; r--) {
    const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
    const raw = data[r]?.[0];
    const fmt = ws[cellRef]?.w;
    const str = String(fmt || raw || '').trim();

    const parts = str.split(/[\/\-]/).map(p => parseInt(p.trim()));
    let isEndOfPrevMonth = false;
    if (parts.length === 3) {
      const y = parts[2];
      const isYear = (y === (prevYear % 100) || y === prevYear);
      if (isYear) {
        if ((parts[0] === prevMonth && parts[1] >= 15 && parts[1] <= 31) || 
            (parts[1] === prevMonth && parts[0] >= 15 && parts[0] <= 31)) {
          isEndOfPrevMonth = true;
        }
      }
    } else if (typeof raw === 'number') {
      const dt = new Date(Math.round((raw - 25569) * 86400 * 1000));
      if (dt.getFullYear() === prevYear && dt.getMonth() === (prevMonth - 1) && dt.getDate() >= 15) {
        isEndOfPrevMonth = true;
      }
    }

    if (isEndOfPrevMonth) {
      currentMonthStartIndex = r + 1;
      console.log(`\nMatched end of prevMonth at r=${r} (Excel row ${r + 1}): "${str}", raw=${raw}`);
      break;
    }
  }

  console.log(`\nOctober starts at row ${currentMonthStartIndex + 1}`);
  console.log(`Total October leads: ${lastRow - currentMonthStartIndex + 1}`);
}

inspectTail().catch(console.error);
