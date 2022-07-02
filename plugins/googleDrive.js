const { getGoogleClient } = require('../utils/getAuthenticatedGoogleClient');

const getDocHTML = async (fileId) => {
  const google = await getGoogleClient();
  const drive = google.drive('v3');
  const { data: html } = await drive.files.export({
    fileId,
    mimeType: 'text/html'
  });
  console.log('html: ', html);
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
  console.log('dataArr: ', dataArr);
  return dataArr;
};

// getDocHTML('1gPfUidCtPwPOWyXNPsJDN7BXuKba4-iD5M1Ug5AYGdY');
getSheetData('1_NrUTRK5SSxkVf5h-ns8fwKzNnWhHQmFGAD7DISJ7bg', 'Sheet1');