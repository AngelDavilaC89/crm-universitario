const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

function parseLeadDate(rawCell, fmtCell, targetMonth = 10, targetYear = 2026) {
  // 1. Prioritize formatted string if available
  const fechaStr = fmtCell || (typeof rawCell === 'string' ? rawCell : null);
  
  if (fechaStr && typeof fechaStr === 'string') {
    const cleanStr = fechaStr.trim();
    const parts = cleanStr.split(/[\/\-]/).map(p => p.trim());
    if (parts.length === 3) {
      const y = parseInt(parts[2]);
      if (y === (targetYear % 100) || y === targetYear) {
        const n0 = parseInt(parts[0]);
        const n1 = parseInt(parts[1]);
        
        let day = null;
        // If n0 is targetMonth, n1 is day (e.g. 10/14/26 or 10/3/26)
        if (n0 === targetMonth && n1 >= 1 && n1 <= 31) {
          day = n1;
        } 
        // If n1 is targetMonth, n0 is day (e.g. 14/10/26 or 3/10/26)
        else if (n1 === targetMonth && n0 >= 1 && n0 <= 31) {
          day = n0;
        }
        
        if (day !== null) {
          return {
            isValid: true,
            formatted: `${day}/${targetMonth}/${targetYear}`,
            day
          };
        }
      }
    }
  }

  // 2. If raw number (Excel serial)
  if (typeof rawCell === 'number') {
    const dt = new Date(Math.round((rawCell - 25569) * 86400 * 1000));
    if (!isNaN(dt.getTime()) && dt.getFullYear() === targetYear && dt.getMonth() === (targetMonth - 1)) {
      return {
        isValid: true,
        formatted: `${dt.getDate()}/${targetMonth}/${targetYear}`,
        day: dt.getDate()
      };
    }
  }

  // 3. If JS Date
  if (rawCell instanceof Date && !isNaN(rawCell.getTime())) {
    if (rawCell.getFullYear() === targetYear && rawCell.getMonth() === (targetMonth - 1)) {
      return {
        isValid: true,
        formatted: `${rawCell.getDate()}/${targetMonth}/${targetYear}`,
        day: rawCell.getDate()
      };
    }
  }

  return { isValid: false, formatted: null };
}

async function testAll() {
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

    const validRows = [];
    for (let r = 1; r < data.length; r++) {
      if (data[r] && data[r][1]) {
        validRows.push({ r, row: data[r] });
      }
    }

    let validCount = 0;
    // Scan only the last 150 non-empty rows of the sheet
    const recentRows = validRows.slice(-150);

    for (const item of recentRows) {
      const cellRef = XLSX.utils.encode_cell({ r: item.r, c: 0 });
      const raw = item.row[0];
      const fmt = ws[cellRef]?.w;
      const resDate = parseLeadDate(raw, fmt, 10, 2026);
      if (resDate.isValid) {
        validCount++;
      }
    }

    console.log(`[${f.name}] Total October leads found in recent block: ${validCount} (out of ${validRows.length} valid rows)`);
  }
}

testAll();
