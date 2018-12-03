const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const models = require('../models');

const Image = models.Image;
const bucketName = 'lowpass-uploads';

const s3 = new AWS.S3({
    accessKeyId: 'AKIAIIV5KKBRF7GNWLMA',
    secretAccessKey: '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',
    Bucket: bucketName
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
};

const multerS3Config = multerS3({
    s3: s3,
    bucket: bucketName,
    metadata: function (req, file, cb) {
        cb(null, {
            fieldName: file.fieldname,
            tag: req.body.tag,
            title: req.body.title,
            owner: req.session.account._id
        });
    },
    key: function (req, file, cb) {
        var fileName = new Date().toISOString() + '-' + file.originalname;
        cb(null, `${req.session.account._id}/${fileName}`)
    }
});

const uploadImageS3 = multer({
    storage: multerS3Config,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
    }
});

const saveImage = (req, res) => {
    var isPublic = (!req.body.public) ? false : true;
    const imageData = {
        title: req.body.title,
        tags: req.body.tag,
        fileName: req.files[0].originalname,
        url: req.files[0].key,
        owner: req.session.account._id,
        keyPath: req.files[0].key,
        visibility: isPublic,
    }

    const newImage = new Image.ImageModel(imageData);
    const imagePromise = newImage.save();

    imagePromise.then(() => {
        return res.status(200).json({ redirect: '/account' })
    });

    imagePromise.catch((err) => {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred' });
    });

};

const getAccountImages = (req, res) => {
    Image.ImageModel.findByOwner(req.session.account._id, (err, docs) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: 'An error occurred' });
        }

        return res.status(200).json({ images: docs });
    });
};

const getAllPublicImages = (req, res) => {
    Image.ImageModel.findAllPublic((err, docs) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: 'An error occurred' });
        }

        return res.status(200).json({ images: docs });
    });
};

const deleteImageS3 = (req, res, next) => {
    var item = `${req.session.account._id}/${req.params.id}`;
    var params = { Bucket: bucketName, Key: item };
    s3.deleteObjects(params, function (err, data) {
        return next();
    });
};

const deleteImage = (req, res) => Image.ImageModel.deleteById(`${req.session.account._id}/${req.params.id}`, (err, docs) => {
    if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ images: docs });
});

module.exports.getAccountImages = getAccountImages;
module.exports.deleteImage = deleteImage;
module.exports.deleteImageS3 = deleteImageS3;
module.exports.uploadImageS3 = uploadImageS3;
module.exports.saveImage = saveImage; 
module.exports.getAllPublicImages = getAllPublicImages;