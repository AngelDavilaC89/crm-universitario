const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log("Fetching file...");
    const response = await drive.files.get(
      { fileId: '1roghd1regvcNS2T06cO31vG_vQ4fUKtt', alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    console.log("Success! Buffer length:", response.data.byteLength);
  } catch (error) {
    console.error("ERROR MESSAGE:", error.message);
    if (error.response && error.response.data) {
        console.error("RESPONSE DATA:", error.response.data);
    }
  }
}
run();
