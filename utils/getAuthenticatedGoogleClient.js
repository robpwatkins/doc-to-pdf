const { google } = require('googleapis');
const { replace } = require('lodash');

const getGoogleJwt = async () => {
  const jwt = new google.auth.JWT(
    process.env.GOOGLE_JWT_CLIENT_EMAIL,
    null,
    replace(process.env.GOOGLE_JWT_PRIVATE_KEY, new RegExp("\\\\n", "\g"), "\n"),
    [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
    ]
  );
  return jwt;
}

const getGoogleClient = async () => {
  try {
    const jwt = await getGoogleJwt();
    await jwt.authorize();
    google.options({ auth: jwt });
    return google;
  } catch(error) {
    console.log('error: ', error);
  }
};

module.exports = { getGoogleJwt, getGoogleClient };