const { getDocHTML, getSheetData } = require('../plugins/googleDrive');
const cheerio = require('cheerio');
const css = require('css');
const Handlebars = require('handlebars');

const show = async (req, res) => {
  const { user_id: userId, email } = req.query;
  if (userId) {
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
    html = html.split('[[ signature ]]').join('<span class=signature>Signature</span>');
    html = html.split('[[ initials ]]').join('<span class=initials>Initials</span>');
    const users = await getSheetData('1_NrUTRK5SSxkVf5h-ns8fwKzNnWhHQmFGAD7DISJ7bg', 'Sheet1');
    const obj = {};
    obj.user = users.find(user => user.id === userId);
    const $ = cheerio.load(html);
    if (req.query.backend) {
      const template = Handlebars.compile($.html());
      html = template(JSON.parse(JSON.stringify(obj)));
      return res.send(html);
    }
    $('body').append(`
      <style>
        .signature, .initials {
          color: lightgray;
          font-family: cursive;
        }

        .entered {
          color: black;
        }
      </style>
      <input name="signature" placeholder=Signature />
      <br />
      <input name="initials" placeholder=Initials />
      <br />
      <button id="download" onclick="downloadPDF()" style="margin-top: 10px;">SIGN AND DOWNLOAD</button>
      <script>
        document.querySelector('[name="signature"]').addEventListener('keyup', (e) => {
          document.querySelectorAll('.signature').forEach(el => {
            console.log('value: ', e.target.value);
            el.innerHTML = e.target.value;
            el.classList.add('entered');
          })
        })
        document.querySelector('[name="initials"]').addEventListener('keyup', (e) => {
          document.querySelectorAll('.initials').forEach(el => {
            el.innerHTML = e.target.value;
            el.classList.add('entered');
          })
        })
        function downloadPDF() {
          var options = {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_id: "${userId}",
              email: "${email}",
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