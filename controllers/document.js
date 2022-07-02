const { getDocHTML, getSheetData } = require('../plugins/googleDrive');
const Handlebars = require('handlebars');

const show = async (req, res) => {
  const { contact_id: contactId, email } = req.query;
  let html = await getDocHTML('1dFpDXz2sv3h4XPR-kt0gV7v6LP5Zq3sMrhSfEhOmo5M');
  const contacts = await getSheetData('1_NrUTRK5SSxkVf5h-ns8fwKzNnWhHQmFGAD7DISJ7bg', 'Sheet1');
  const obj = {};
  obj.contact = contacts.find(contact => contact.id === contactId);
  const template = Handlebars.compile(html);
  html = template(JSON.parse(JSON.stringify(obj)));
  console.log('html: ', html);
  res.send(html);
};

module.exports = { show };