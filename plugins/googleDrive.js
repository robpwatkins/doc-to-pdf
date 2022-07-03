const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { getGoogleJwt, getGoogleClient } = require('../utils/getAuthenticatedGoogleClient');

// const getDocInfo = async (docName) => {
//   const jwt = await getGoogleJwt();
//   await jwt.authorize();
//   const { access_token: accessToken } = jwt.gtoken.rawToken;
//   const response = await (await fetch(`https://docs.googleapis.com/v1/files?name=${docName}`, {
//     headers: { Authorization: `Bearer ${accessToken}` }
//   })).json();
//   console.log('response: ', response);
// };

const getTemplateIds = async (templatesName) => {
  const google = await getGoogleClient();
  const drive = google.drive('v3');
  const { files } = (await drive.files.list({
    q: `name contains '${templatesName}'`,
    fields: 'nextPageToken, files(id, name)',
    spaces: 'drive',
  })).data;
  const sortedFiles = files.sort((a, b) => {
    const numA = Number(a.name.split(' - ')[1].split('')[0]);
    const numB = Number(b.name.split(' - ')[1].split('')[0]);
    return numA > numB ? 1 : -1;
  });
  return sortedFiles.map((file) => file.id);
};

const getDocHTML = async (fileId) => {
  const google = await getGoogleClient();
  const drive = google.drive('v3');
  const { data: html } = await drive.files.export({
    fileId,
    mimeType: 'text/html'
  });
  return html;
};

const getSheetData = async (spreadsheetId, range) => {
  const google = await getGoogleClient();
  const sheets = await google.sheets('v4');
  const { values: rows } = (await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  })).data;
  const dataArr = [];
  const columnNames = rows[0];
  rows.forEach((row, index) => {
    if (index == 0) return;
    const rowObj = {};
    row.forEach((cell, index) => {
      rowObj[columnNames[index]] = cell;
    })
    dataArr.push(rowObj);
  })
  return dataArr;
};

module.exports = { getTemplateIds, getDocHTML, getSheetData };

// getTemplateIds('TX EP');
// getDocHTML('1gPfUidCtPwPOWyXNPsJDN7BXuKba4-iD5M1Ug5AYGdY');
// getSheetData('1_NrUTRK5SSxkVf5h-ns8fwKzNnWhHQmFGAD7DISJ7bg', 'Sheet1');