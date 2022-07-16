const { getDocInfo, getTemplateIds, getDocHTML, getSheetData } = require('../plugins/googleDrive');
const { buildPages, updateValues, downloadPDF, saveByteArr } = require('../utils/scripts');
const cheerio = require('cheerio');
const css = require('css');
const Handlebars = require('handlebars');

const show = async (req, res) => {
  const { templateTag } = req.params;
  const { user_id: userId, email } = req.query;
  if (userId) {
    const templateIds = await getTemplateIds(templateTag);
    const docTemplates = await Promise.all(templateIds.map((templateId) => getDocHTML(templateId)));
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
      html.head += $('head').html();
      html.body += `<div id="template-${idx}" class="template">${$('body').html()}</div>`;
    })
    html.body = `<div id="templates">${html.body}</div>`;
    const initialInputs = `
      <div id="modal">
        <div id="inputs">
          <br />
          <input id="signature" name="signature" placeholder=Signature />
          <br />
          <input id="initials" name="initials" placeholder=Initials />
        </div>
      </div>
    `;
    html = `
      <html>
        <head>${html.head}</head>
        <body>
          ${!req.query.backend ? initialInputs : ''}
          ${html.body}
        </body>
      </html>
    `;
    html = html.split('[[ signature ]]').join('<span class=signature>Signature</span>');
    html = html.split('[[ initials ]]').join('<span class=initials>Initials</span>');

    const templatesInfo = await Promise.all(templateIds.map(async templateId => getDocInfo(templateId)));

    const templatesInfoStr = JSON.stringify(templatesInfo);

    const users = await getSheetData('1_NrUTRK5SSxkVf5h-ns8fwKzNnWhHQmFGAD7DISJ7bg', 'Sheet1');
    const obj = {};
    obj.user = users.find(user => user.id === userId);
    const $ = cheerio.load(html);
    $('body').append(`
      <style>
        body {
          padding: 127px 0 0 256px;
          background-color: #cccccc;
        }

        #templates {
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-wrap: anywhere;
          background-color: white;
        }

        #modal {
          position: fixed;
          top: 0;
          display: none;
          justify-content: center;
          align-items: center;
          width: 100vw;
          height: 100vh;
          background-color: #000000a1;
          -webkit-backdrop-filter: blur(3px);
          backdrop-filter: blur(3px);
          z-index: 1;
        }

        #inputs {
          background-color: #cccccc;
          border: 1px solid black;
          padding: 25px 42px 10px;
          border-radius: 5px;
        }

        #inputs:hover {
          box-shadow: 2px 2px 7px black;
        }

        #instructions {
          width: 216px;
        }

        .signature, .initials {
          color: lightgray;
          font-family: cursive;
        }
        
        .entered {
          color: black;
        }

        .backend {
          font-style: italic;
        }
      </style>
    `);
    if (req.query.backend) {
      const template = Handlebars.compile($.html());
      html = template(JSON.parse(JSON.stringify(obj)));
      return res.send(html);
    }
    $('#templates').append(`
      <script>
        const templatesInfo = ${templatesInfoStr};
        const buildPages = ${buildPages};
        const updateValues = ${updateValues};
        const downloadPDF = ${downloadPDF};
        const saveByteArr = ${saveByteArr};
        buildPages(templatesInfo);
        document.querySelector("#signature").addEventListener('keyup', (e) => updateValues(e));
        document.querySelector("#initials").addEventListener('keyup', (e) => updateValues(e));
        document.querySelector("#download").addEventListener('click', () => {
          const signature = document.querySelector("#signature").value;
          const initials = document.querySelector("#initials").value;
          downloadPDF("${templateTag}", "${userId}", "${email}", signature, initials);
        });
      </script>
    `);
    const template = Handlebars.compile($.html());
    html = template(JSON.parse(JSON.stringify(obj)));
    res.send(html);
  } else res.send('Missing query params!');
};

module.exports = { show };