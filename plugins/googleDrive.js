const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { getGoogleJwt, getGoogleClient } = require('../utils/getAuthenticatedGoogleClient');

const getDocInfo = async (fileId) => {
  const jwt = await getGoogleJwt();
  await jwt.authorize();
  const { access_token: accessToken } = jwt.gtoken.rawToken;
  console.log('accessToken: ', accessToken);
  const response = await (await fetch(`https://docs.googleapis.com/v1/documents/${fileId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })).json();
  console.log('response: ', response);
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

module.exports = { getDocHTML, getSheetData };

getDocInfo('1gPfUidCtPwPOWyXNPsJDN7BXuKba4-iD5M1Ug5AYGdY');
// getDocHTML('1gPfUidCtPwPOWyXNPsJDN7BXuKba4-iD5M1Ug5AYGdY');
// getSheetData('1_NrUTRK5SSxkVf5h-ns8fwKzNnWhHQmFGAD7DISJ7bg', 'Sheet1');