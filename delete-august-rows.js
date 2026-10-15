const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function deleteAugustRows() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Double check the exact rows to delete
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Leads!A787:D792',
  });

  console.log("Rows about to be deleted:");
  res.data.values.forEach((r, idx) => {
    console.log(`[${787 + idx}] ${r[1]} - ${r[2]}`);
  });

  if (res.data.values.length !== 6 || !res.data.values[0][2].includes('María Guadalupe')) {
    console.error("SAFETY CHECK FAILED: Rows do not match expected Maria Guadalupe!");
    return;
  }

  // 2. Perform deletion
  console.log("\nDeleting rows 787 to 792 (startIndex: 786, endIndex: 792)...");
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // Leads tab
              dimension: 'ROWS',
              startIndex: 786,
              endIndex: 792
            }
          }
        }
      ]
    }
  });

  console.log("Deletion complete!");

  // 3. Verify what is now at row 787
  const verifyRes = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Leads!A785:D790',
  });
  console.log("\nNew rows around row 787:");
  verifyRes.data.values.forEach((r, idx) => {
    console.log(`[${785 + idx}] ${r[1]} - ${r[2]}`);
  });
}

deleteAugustRows();
