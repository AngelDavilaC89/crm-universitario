const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkCrmLeads() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Leads!A1:N200',
  });

  const rows = res.data.values || [];
  console.log("Total leads in CRM Sheet:", rows.length);
  
  const pmLeads = rows.filter(r => r[5] === 'PM-Padre Mier');
  console.log("Total Padre Mier leads:", pmLeads.length);
  pmLeads.forEach((r, idx) => {
    console.log(`[${idx}] ID=${r[0]} | Fecha=${r[1]} | Nombre=${r[2]} | Tel=${r[3]}`);
  });
}

checkCrmLeads();
