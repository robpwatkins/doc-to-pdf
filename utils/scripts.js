function setValues(signature, initials) {
  const values = { signature, initials };
  for (key in values) {
    document.querySelectorAll(`.${key}`).forEach(el => {
      el.innerHTML = values[key];
      el.classList.add('entered', 'backend');
    })
  }
};

function updateValues(e) {
  const selector = "." + e.target.name;
  document.querySelectorAll(selector).forEach(el => {
    if (e.target.value) {
      el.innerHTML = e.target.value;
      el.classList.add("entered");
    } else {
      el.innerHTML = e.target.placeholder;
      el.classList.remove("entered");
    }
  });
};

function downloadPDF(templateTag, userId, email, signature, initials) {
  const options = {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      template_tag: templateTag,
      user_id: userId,
      email: email,
      signature,
      initials
    })
  };
  fetch("/pdf/download", options)
    .then(response => response.arrayBuffer())
    .then(buffer => saveByteArr('test-PDF', buffer))
};

async function saveByteArr(fileName, byte) {
  const blob = new Blob([byte], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

module.exports = { setValues, updateValues, downloadPDF, saveByteArr };
