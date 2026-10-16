const { google } = require('googleapis');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

async function debugSync() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const fileId = '1Y4I6ranofhzrVTcXfReNVta4_YbuGmQO';
  const sheetName = 'KAREN VILLARREAL';
  const colMap = {
    prospecto: '1',
    celular: '2',
    correo: '3',
    carrera: '5',
    comentario: '11'
  };

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  const buffer = Buffer.from(response.data);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

  // 1. Encontrar la última fila con datos reales
  let lastRow = -1;
  for (let r = data.length - 1; r >= 1; r--) {
    if (data[r] && (data[r][0] || data[r][1])) {
      lastRow = r;
      break;
    }
  }

  console.log("Last row:", lastRow, "(Excel row " + (lastRow + 1) + ")");

  // 2. Encontrar el corte exacto de fin de Septiembre
  let octoberStartIndex = 1;
  for (let r = lastRow; r >= 1; r--) {
    const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
    const raw = data[r]?.[0];
    const fmt = worksheet[cellRef]?.w;
    const str = String(fmt || raw || '').trim();

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
      octoberStartIndex = r + 1;
      console.log(`Matched end of September at r=${r} (Excel row ${r + 1}): "${str}", raw=${raw}`);
      break;
    }
  }

  console.log("octoberStartIndex:", octoberStartIndex, "(Excel row " + (octoberStartIndex + 1) + ")");

  const now = new Date();
  const targetMonth = now.getMonth() + 1;
  const targetYear = now.getFullYear();

  const toInsert = [];

  for (let i = octoberStartIndex; i <= lastRow; i++) {
    const row = data[i];
    const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
    if (!row || row.length === 0) continue;

    const prospecto = String(row[Number(colMap.prospecto)] || '').trim();
    const celularRaw = row[Number(colMap.celular)];
    let celularOriginal = celularRaw ? String(celularRaw).trim() : '';
    if (celularOriginal.includes('E+')) {
      celularOriginal = Number(celularRaw).toLocaleString('fullwide', {useGrouping:false});
    }
    const celularLimpio = celularOriginal.replace(/\D/g, '');
    if (!prospecto || !celularOriginal || celularOriginal === 'NA' || celularOriginal === '#ERROR!') continue;

    const cellFormatted = worksheet[cellRef]?.w;
    const rawCell = row[0];

    let isCurrentMonth = false;
    let fechaFinalString = '15/10/2026';

    const fechaStr = cellFormatted || (typeof rawCell === 'string' ? rawCell : null);
    if (fechaStr && typeof fechaStr === 'string') {
      const parts = fechaStr.trim().split(/[\/\-]/).map(p => p.trim());
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
            isCurrentMonth = true;
            fechaFinalString = `${day}/${targetMonth}/${targetYear}`;
          }
        }
      }
    }

    if (!isCurrentMonth && typeof rawCell === 'number') {
      const dt = new Date(Math.round((rawCell - 25569) * 86400 * 1000));
      if (!isNaN(dt.getTime()) && dt.getFullYear() === targetYear && dt.getMonth() === (targetMonth - 1)) {
        isCurrentMonth = true;
        fechaFinalString = `${dt.getDate()}/${targetMonth}/${targetYear}`;
      }
    }

    if (!isCurrentMonth && rawCell instanceof Date && !isNaN(rawCell.getTime())) {
      if (rawCell.getFullYear() === targetYear && rawCell.getMonth() === (targetMonth - 1)) {
        isCurrentMonth = true;
        fechaFinalString = `${rawCell.getDate()}/${targetMonth}/${targetYear}`;
      }
    }

    if (!isCurrentMonth) continue;

    toInsert.push({ r: i + 1, name: prospecto, tel: celularOriginal, date: fechaFinalString });
  }

  console.log(`Total leads to insert: ${toInsert.length}`);
  const hasMaria = toInsert.find(l => l.name.toLowerCase().includes('maría guadalupe'));
  console.log("Has Maria Guadalupe?:", hasMaria ? "YES" : "NO");
}

debugSync();
