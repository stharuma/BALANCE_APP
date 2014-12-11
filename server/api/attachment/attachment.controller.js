'use strict';

var Attachment = require('./attachment.model');

// Creates a new attachment in the DB.
exports.create = function(req, res) {
    req.body.type = 'Attachment';
    Attachment.create(req.body, function(err, attachment) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, attachment);
    });
};

function handleError(res, err) {
    return res.send(500, err);
}