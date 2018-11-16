const makePage = (req, res) => res.render('app', { csrfToken: req.csrfToken() });

const uploadImage = (req, res) => {
  res.json({ success: 'Finished uploading image.' });
};


module.exports.uploadImage = uploadImage;
module.exports.makePage = makePage;
