const controllers = require('./controllers');
const mid = require('./middleware');

// routes to go to
const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/account', mid.requiresLogin, controllers.Profile.makePage);
  app.get('/getAccountInfo', mid.requiresLogin, controllers.Account.getInfo);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/files', mid.requiresSecure, controllers.Images.getFilesJson);
  app.get('/files/:filename', mid.requiresLogin, controllers.Images.getFileJson);
  app.get('/image/:filename', mid.requiresLogin, controllers.Images.getImage);
  app.delete('/files/:id', mid.requiresLogin, controllers.Images.deleteFile);
  app.post(
    '/uploadImage',
    mid.requiresLogin,
    mid.upload.single('file'),
    controllers.Profile.uploadImage);
};


module.exports = router;
