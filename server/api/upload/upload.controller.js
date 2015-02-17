'use strict';

var fs = require('fs');
var path = require('path');
var config = require('../../config/environment');

exports.upload = function(req, res) {
    var file = req.files.file;
    var obj = {};
    obj.filename = file.originalFilename;
    obj.tmpFilename = file.path.split('\\').pop().split('/').pop();
    obj.size = file.size;
    obj.type = file.type;
    return res.json(200, obj);
};

exports.processAttachment = function(newobj) {
    var tmpFile = path.join(config.attachmentsPath, newobj.tmpFilename);
    if (fs.existsSync(tmpFile) === false) {
        throw 'tmpfile not found.';
    }

    // this part use recursive mkdir future
    var commDir = path.join(config.attachmentsPath, newobj.communityId);
    if (fs.existsSync(commDir) === false) {
        fs.mkdirSync(commDir);
    }
    var contribDir = path.join(commDir, newobj._id);
    if (fs.existsSync(contribDir) === false) {
        fs.mkdirSync(contribDir);
    }
    var versionDir = path.join(contribDir, newobj.data.version.toString());
    if (fs.existsSync(versionDir) === false) {
        fs.mkdirSync(versionDir);
    }
    var newFile = path.join(versionDir, newobj.data.filename);
    fs.renameSync(tmpFile, newFile);

    delete newobj.data.tmpFilename;
    newobj.data.url = path.join(config.attachmentsURL, newobj.communityId, newobj._id, newobj.data.version.toString(), newobj.data.filename);
};
