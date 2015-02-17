'use strict';

exports.upload = function(req, res) {
    var file = req.files.file;
    var obj = {};
    obj.filename = file.originalFilename;
    obj.tmpFilename = file.path.split('\\').pop().split('/').pop();
    obj.size = file.size;
    obj.type = file.type;
    return res.json(200, obj);
};
