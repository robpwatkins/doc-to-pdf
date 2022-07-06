const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { getGoogleJwt, getGoogleClient } = require('../utils/getAuthenticatedGoogleClient');

const getDocInfo = async (docId) => {
  const jwt = await getGoogleJwt();
  await jwt.authorize();
  const { access_token: accessToken } = jwt.gtoken.rawToken;
  const response = await (await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })).json();
  return response;
};

const getMarginsAndDimensions = (documentStyle) => {
  const { marginTop, marginBottom, marginRight, marginLeft, pageSize } = documentStyle;
  return {
    margins: {
      top: marginTop.magnitude,
      right: marginRight.magnitude,
      bottom: marginBottom.magnitude,
      left: marginLeft.magnitude
    },
    dimensions: { height: pageSize.height.magnitude, width: pageSize.width.magnitude }
  };
};

const getTemplateIds = async (templateTag) => {
  const google = await getGoogleClient();
  const drive = google.drive('v3');
  let { files } = (await drive.files.list({
    q: `name contains '${templateTag}'`,
    fields: 'files(id, name)',
  })).data;
  if (files.length > 1) {
    files = files.sort((a, b) => {
      const numA = Number(a.name.split(' - ')[1].charAt(0));
      const numB = Number(b.name.split(' - ')[1].charAt(0));
      return numA > numB ? 1 : -1;
    });
  }
  return files.map((file) => file.id);
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

module.exports = { getDocInfo, getMarginsAndDimensions, getTemplateIds, getDocHTML, getSheetData };

// getDocInfo('1dFpDXz2sv3h4XPR-kt0gV7v6LP5Zq3sMrhSfEhOmo5M');
// getTemplateIds('TX EP');
// getDocHTML('1gPfUidCtPwPOWyXNPsJDN7BXuKba4-iD5M1Ug5AYGdY');
// getSheetData('1_NrUTRK5SSxkVf5h-ns8fwKzNnWhHQmFGAD7DISJ7bg', 'Sheet1');