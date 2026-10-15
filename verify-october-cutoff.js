const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

function parseLeadDate(rawCell, fmtCell, targetMonth = 10, targetYear = 2026) {
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
        if (n0 === targetMonth && n1 >= 1 && n1 <= 31) {
          day = n1;
        } else if (n1 === targetMonth && n0 >= 1 && n0 <= 31) {
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

async function verifyExtraction() {
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

    // 1. Encontrar la última fila con datos
    let lastRow = -1;
    for (let r = data.length - 1; r >= 1; r--) {
      if (data[r] && (data[r][0] || data[r][1])) {
        lastRow = r;
        break;
      }
    }

    // 2. Caminar hacia atrás desde la última fila y detenerse en cuanto encontremos Septiembre
    let octoberStartIndex = -1;
    for (let r = lastRow; r >= 1; r--) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
      const raw = data[r]?.[0];
      const fmt = ws[cellRef]?.w;
      const str = String(fmt || raw || '').trim();

      // Es septiembre si empieza con 9/ o termina con /9/26 o 30/09 o similar
      const isSept = str.startsWith('9/') || str.startsWith('09/') || str.includes('/9/26') || str.includes('/09/26') || str.includes('09/2026');
      if (isSept) {
        octoberStartIndex = r + 1; // Octubre empieza en la siguiente fila
        break;
      }
    }

    console.log(`\n================== [${f.name}] ==================`);
    console.log(`October starts at Row ${octoberStartIndex + 1} and ends at Row ${lastRow + 1}`);

    const extracted = [];
    for (let r = octoberStartIndex; r <= lastRow; r++) {
      const row = data[r];
      if (!row || !row[1]) continue;
      const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
      const raw = row[0];
      const fmt = ws[cellRef]?.w;
      const parsed = parseLeadDate(raw, fmt, 10, 2026);
      if (parsed.isValid) {
        extracted.push({
          row: r + 1,
          date: parsed.formatted,
          rawDate: fmt || raw,
          name: row[1],
          tel: row[2]
        });
      }
    }

    console.log(`Total valid October leads: ${extracted.length}`);
    console.log("First 3 leads:");
    console.log(extracted.slice(0, 3));
    console.log("Last 3 leads:");
    console.log(extracted.slice(-3));

    // Verificar si María Guadalupe está aquí
    const foundMaria = extracted.find(l => l.name.toLowerCase().includes('maría guadalupe') || l.name.toLowerCase().includes('gonzález uribe'));
    console.log("¿Está María Guadalupe González Uribe?:", foundMaria ? "SÍ (ERROR!)" : "NO (CORRECTO - Fue filtrada exitosamente!)");
  }
}

verifyExtraction();
