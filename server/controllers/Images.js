const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let conn;
conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));

let gfs;

conn.once('open', () => {
    //init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

const getFilesJson = (req, res) => {
    gfs.files.find({ "metadata.owner": req.session.account._id }).toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                error: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
};

const getFileJson = (req, res) => {
    gfs.files.findOne({ "filename": req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                error: 'No file exists'
            });
        }
        // File exists
        return res.json(file);
    });
};

const getImage = (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
};


const deleteFile = (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ error: err });
        }

        return res.status(202).json({ success: "Successfully deleted file" });
    });
};


module.exports.getImage = getImage;
module.exports.getFilesJson = getFilesJson;
module.exports.getFileJson = getFileJson;
module.exports.deleteFile = deleteFile;