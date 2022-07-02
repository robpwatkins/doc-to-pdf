const puppeteer = require('puppeteer');

const download = async (req, res) => {
  const { contact_id, email } = req.body;
  console.log('contact_id: ', contact_id);
  console.log('email: ', email);
};

module.exports = { download };