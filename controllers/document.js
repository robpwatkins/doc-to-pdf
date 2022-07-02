const show = async (req, res) => {
  const { contact_id: contactId, email } = req.query;
  res.send(`You've visited with contact ID: ${contactId} and email: ${email}!`);
};

module.exports = { show };