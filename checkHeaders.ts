import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

(async () => {
  const { googleSheets } = await import('./src/lib/google-sheets');
  await googleSheets.init();
  const s = (googleSheets as any).doc.sheetsByTitle['Inscritos'];
  await s.loadHeaderRow();
  console.log('Inscritos Headers:', s.headerValues);
  
  const rows = await s.getRows();
  if (rows.length > 0) {
    console.log('First row example:', rows[0].toObject());
  }
})();
