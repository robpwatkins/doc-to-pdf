const { setValues } = require('../utils/scripts');
const puppeteer = require('puppeteer');

const download = async (req, res) => {
  const { template_tag: templateTag, user_id: userId, email, signature, initials } = req.body;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.goto(`https://rpw.ngrok.io/document/${templateTag}?user_id=${userId}&backend=true`, { waitUntil: 'networkidle0' });
  await page.addScriptTag({ path: './utils/scripts.js' });
  await page.evaluate((signature, initials) => {
    setValues(signature, initials);
  }, signature, initials)
  const buffer = await page.pdf();
  res.end(buffer);
};

module.exports = { download };