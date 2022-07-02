const { google } = require('googleapis');
const { replace } = require('lodash');

const jwt = new google.auth.JWT(
  process.env.GOOGLE_JWT_CLIENT_EMAIL,
  null,
  replace(process.env.GOOGLE_JWT_PRIVATE_KEY, new RegExp("\\\\n", "\g"), "\n"),
  [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/spreadsheets'
  ]
);

const getGoogleClient = async () => {
  try {
    await jwt.authorize();
    google.options({ auth: jwt });
    return google;
  } catch(error) {
    console.log('error: ', error);
  }
};

module.exports = { getGoogleClient };