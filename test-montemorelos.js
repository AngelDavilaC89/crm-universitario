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
  const sheetName = 'Brenda Caballero';
  const campusId = 'MM-Montemorelos';
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

  const existingRecords = new Set();
  const leadsToInsert = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const prospecto = String(row[Number(colMap.prospecto)] || '').trim();
    const celularRaw = row[Number(colMap.celular)];
    let celularOriginal = celularRaw ? String(celularRaw).trim() : '';
    if (celularOriginal.includes('E+')) {
      celularOriginal = Number(celularRaw).toLocaleString('fullwide', {useGrouping:false});
    }
    const celularLimpio = celularOriginal.replace(/\D/g, '');
    if (!prospecto || !celularOriginal || celularOriginal === 'NA' || celularOriginal === '#ERROR!') continue;

    const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
    const cellFormatted = worksheet[cellRef]?.w;
    const fechaCell = cellFormatted || row[0];

    let isOctober2026 = false;
    let fechaFinalString = '05/10/2026';

    if (fechaCell instanceof Date) {
      if (!isNaN(fechaCell.getTime()) && fechaCell.getMonth() === 9 && fechaCell.getFullYear() === 2026) {
        isOctober2026 = true;
        fechaFinalString = `${fechaCell.getDate()}/${fechaCell.getMonth() + 1}/${fechaCell.getFullYear()}`;
      }
    } else if (typeof fechaCell === 'number') {
      const dateObj = new Date(Math.round((fechaCell - 25569) * 86400 * 1000));
      if (!isNaN(dateObj.getTime()) && dateObj.getMonth() === 9 && dateObj.getFullYear() === 2026) {
        isOctober2026 = true;
        fechaFinalString = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
      }
    } else if (typeof fechaCell === 'string') {
      const fechaCruda = fechaCell.trim();
      if (fechaCruda.startsWith('10/') && (fechaCruda.endsWith('/26') || fechaCruda.endsWith('/2026'))) {
        isOctober2026 = true;
        const parts = fechaCruda.split('/');
        fechaFinalString = `${parts[1]}/10/2026`;
      } else {
        const dateObj = new Date(fechaCruda);
        if (!isNaN(dateObj.getTime()) && dateObj.getMonth() === 9 && dateObj.getFullYear() === 2026) {
          isOctober2026 = true;
          fechaFinalString = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
        }
      }
    }

    if (!isOctober2026) continue;

    const recordKey = `${prospecto.toLowerCase()}|${celularLimpio}`;
    if (existingRecords.has(recordKey)) {
      console.log(`Duplicate skipped in file: ${prospecto} | ${celularLimpio}`);
      continue;
    }
    existingRecords.add(recordKey);

    const correo = colMap.correo !== undefined ? String(row[Number(colMap.correo)] || '').trim() : '';
    const carrera = colMap.carrera !== undefined ? String(row[Number(colMap.carrera)] || '').trim() : '';
    const comentario = colMap.comentario !== undefined ? String(row[Number(colMap.comentario)] || '').trim() : 'Lead de Excel';

    leadsToInsert.push({
      Fecha: fechaFinalString,
      Prospecto: prospecto,
      Celular: celularOriginal,
      Correo: correo,
      Campus: campusId,
      Carrera: carrera,
      Comentario: comentario
    });
  }

  console.log(`\nTotal leads found for October 2026: ${leadsToInsert.length}`);
  console.log("Leads summary:");
  console.table(leadsToInsert);
}

run();
