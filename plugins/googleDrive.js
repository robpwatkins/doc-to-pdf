const { getGoogleClient } = require('../utils/getAuthenticatedGoogleClient');

const getDocHTML = async (fileId) => {
  const google = await getGoogleClient();
  const drive = google.drive('v3');
  const doc = await drive.files.export({
    fileId,
    mimeType: 'text/html'
  });
  console.log('doc: ', doc);
};

getDocHTML('1gPfUidCtPwPOWyXNPsJDN7BXuKba4-iD5M1Ug5AYGdY');