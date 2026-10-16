const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Leads'];
  if (!sheet) {
    console.error("No se encontró la hoja Leads");
    return;
  }

  const rows = await sheet.getRows();
  console.log("Total rows in Leads:", rows.length);

  // Inspect the last 70 rows
  const recentRows = rows.slice(-70);
  console.log("\n--- RECENT ROWS ---");
  const candidatesToDelete = [];

  recentRows.forEach((r, idx) => {
    const id = r.get('ID Lead');
    const fecha = r.get('Fecha');
    const prospecto = r.get('Prospecto');
    const campus = r.get('Campus de Interés');
    const cel = r.get('Celular');

    const isSuspect = 
      prospecto.toLowerCase().includes('gonzález uribe') ||
      prospecto.toLowerCase().includes('romero noyola') ||
      fecha.includes('/8/') ||
      fecha.startsWith('8/') ||
      fecha.includes('/08/');

    if (isSuspect) {
      console.log(`[SUSPECT] Row index in array: ${rows.length - 70 + idx} | ID: ${id} | Fecha: ${fecha} | Prospecto: ${prospecto} | Campus: ${campus} | Cel: ${cel}`);
      candidatesToDelete.push(r);
    }
  });

  console.log(`\nFound ${candidatesToDelete.length} candidates to delete.`);

  // Delete them if found
  for (const rowToDelete of candidatesToDelete) {
    console.log(`Deleting: ${rowToDelete.get('Prospecto')} (${rowToDelete.get('Fecha')})...`);
    await rowToDelete.delete();
  }

  console.log("Cleanup complete!");
}

run().catch(console.error);
