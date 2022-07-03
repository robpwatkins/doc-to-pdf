const setValues = (signature, initials) => {
  const values = { signature, initials };
  for (key in values) {
    document.querySelectorAll(`.${key}`).forEach(el => {
      el.innerHTML = values[key];
      el.classList.add('entered', 'backend');
    })
  }
};

module.exports = { setValues };