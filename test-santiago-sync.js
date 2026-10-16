const { googleSheets } = require('./src/lib/google-sheets');
require('dotenv').config({ path: '.env.local' });

async function testSantiago() {
  console.log("Testing sync for Santiago...");
  try {
    const inserted = await googleSheets.syncExternalExcelLeads(
      '11oWyQyOlCtqSKr5xFQqf1f0TqZp-hicq',
      'Janeth Villalon',
      'ST-Santiago',
      {
        prospecto: '1',
        celular: '2',
        correo: '3',
        carrera: '5',
        comentario: '10'
      }
    );
    console.log("Sync completed successfully!");
    console.log(`Inserted: ${inserted} leads.`);
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

testSantiago();
