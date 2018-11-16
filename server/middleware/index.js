const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');


const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/LowPass';

//create storage engine 
const storage = new GridFsStorage({
    url: dbURL,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: {
                        tag: req.body.tag,
                        title: req.body.title,
                        owner: req.session.account._id,
                    },
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

const requiresLogin = (req, res, next) => {
    if (!req.session.account) {
        return res.redirect('/');
    }
    return next();
};

const requiresLogout = (req, res, next) => {
    if (req.session.account) {
        return res.redirect('/account');
    }

    return next();
};

const requiresSecure = (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.hostname}${req.url}`);
    }
    return next();
};

const bypassSecure = (req, res, next) => {
    next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;
module.exports.upload = upload;

if (process.env.NODE_ENV === 'production') {
    module.exports.requiresSecure = requiresSecure;
} else {
    module.exports.requiresSecure = bypassSecure;
}
