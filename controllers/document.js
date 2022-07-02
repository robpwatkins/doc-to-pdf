const { getDocHTML, getSheetData } = require('../plugins/googleDrive');
const cheerio = require('cheerio');
const css = require('css');
const Handlebars = require('handlebars');

const show = async (req, res) => {
  const { contact_id: contactId, email } = req.query;
  if (contactId && email) {
    const docTemplateIds = ['1dFpDXz2sv3h4XPR-kt0gV7v6LP5Zq3sMrhSfEhOmo5M']
    const docTemplates = await Promise.all(docTemplateIds.map((templateId) => getDocHTML(templateId)));
    let html = { head: '', body: '' };
    docTemplates.forEach((template, idx) => {
      const $ = cheerio.load(template);
      const style = $('head style').html() ? css.parse($('head style').html()) : null;
      if (style) {
        style.stylesheet.rules = style.stylesheet.rules.map((rule) => ({
          ...rule,
          selectors: rule.selectors.map((selector) => `#template-${idx} ${selector}`)
        }))
        $('head').append(`<style>${css.stringify(style)}</style>`);
      }
      html.head = $('head').html();
      html.body = `<div id="template-${idx}" class="template">${$('body').html()}</div>`;
    })
    html.body = `<div id="templates">${html.body}</div>`;
    html = `<html><head>${html.head}</head><body>${html.body}</body></html>`;
    const contacts = await getSheetData('1_NrUTRK5SSxkVf5h-ns8fwKzNnWhHQmFGAD7DISJ7bg', 'Sheet1');
    const obj = {};
    obj.contact = contacts.find(contact => contact.id === contactId);
    const $ = cheerio.load(html);
    const initialHTML = JSON.stringify($('html').html());
    $('body').append(`
      <button id="download" onclick="downloadPDF()">DOWNLOAD PDF</button>
      <script>
        function downloadPDF() {
          var options = {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contact_id: "${contactId}",
              email: "${email}",
              html: ${initialHTML}
            })
          };
          fetch("/pdf/download", options)
            .then(response => response.arrayBuffer())
            .then(buffer => saveByteArray('test-PDF', buffer))
        };
        function saveByteArray(fileName, byte) {
          var blob = new Blob([byte], { type: "application/pdf" });
          var link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
        }
      </script>
    `);
    const template = Handlebars.compile($.html());
    html = template(JSON.parse(JSON.stringify(obj)));
    res.send(html);
  } else res.send('Missing query params!');
};

module.exports = { show };