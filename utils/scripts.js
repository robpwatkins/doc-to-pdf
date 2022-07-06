const buildPages = (templatesInfo) => {
  const root = document.querySelector('#templates');
  root.style.width = `${templatesInfo[0].dimensions.width}pt`;
  const templateDivs = root.querySelectorAll('.template');
  const { height: pxPageHeight } = templatesInfo[0].dimensions;
  const initialMargin = document.createElement("div");
  initialMargin.classList.add("margin");
  const { top: marginTop } = templatesInfo[0].margins;
  initialMargin.style.height = `${marginTop}pt`;
  root.insertAdjacentElement('afterbegin', initialMargin);
  let currentHeight = pxPageHeight + marginTop;
  templateDivs.forEach((div, divIndex) => {
    let pageNumber = 1;
    const { title, hasHeader, hasFooter, footnotesCount, margins, dimensions } = templatesInfo[divIndex];
    div.style.margin = `0 ${margins.right}pt 0 ${margins.left}pt`;
    const els = div.querySelectorAll('*');
  })
};

const setValues = (signature, initials) => {
  const values = { signature, initials };
  for (key in values) {
    document.querySelectorAll(`.${key}`).forEach(el => {
      el.innerHTML = values[key];
      el.classList.add('entered', 'backend');
    })
  }
};

const updateValues = (e) => {
  const selector = "." + e.target.name;
  document.querySelectorAll(selector).forEach(el => {
    if (e.target.value) {
      el.innerHTML = e.target.value;
      el.classList.add('entered');
    } else {
      el.innerHTML = e.target.placeholder;
      el.classList.remove('entered');
    }
  });
};

const downloadPDF = (templateTag, userId, email, signature, initials) => {
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_tag: templateTag,
      user_id: userId,
      email: email,
      signature,
      initials
    })
  };
  fetch('/pdf/download', options)
    .then(response => response.arrayBuffer())
    .then(buffer => saveByteArr('test-PDF', buffer))
};

const saveByteArr = (fileName, byte) => {
  const blob = new Blob([byte], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

module.exports = { buildPages, setValues, updateValues, downloadPDF, saveByteArr };
