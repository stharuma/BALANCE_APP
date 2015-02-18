'use strict';

var _ = require('lodash');
var KObject = require('./KObject.model');
var KRecordController = require('../KRecord/KRecord.controller.js');
var upload = require('../upload/upload.controller');

// Get list of KObjects
exports.index = function(req, res) {
    //this should not be used
    res.json(200, []);
};

// Get a single KObject
exports.show = function(req, res) {
    KObject.findById(req.params.id, function(err, obj) {
        if (err) {
            return handleError(res, err);
        }
        if (!obj) {
            return res.send(404);
        }
        return res.json(obj);
    });
};

// Creates a new KObject in the DB.
exports.create = function(req, res) {
    KObject.create(req.body, function(err, obj) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, obj);
    });
};

// Updates an existing contribution in the DB.
exports.update = function(req, res) {
    var newobj = req.body;

    if (newobj.type === 'Attachment' && newobj.tmpFilename) {
        try {
            upload.processAttachment(newobj);
        } catch (e) {
            return res.send(500, e);
        }
    }

    if (newobj._id) {
        delete newobj._id;
        delete newobj.__v; /* by using this, we can avoid conflict of editing multi users*/
    }

    KObject.findById(req.params.id, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        if (!contribution) {
            return res.send(404);
        }
        var updated = _.merge(contribution, newobj);
        if (newobj.authors) {
            updated.authors = newobj.authors;
            updated.markModified('authors');
        }
        if (newobj.keywords) {
            updated.keywords = newobj.keywords;
            updated.markModified('keywords');
        }
        if (newobj.data) {
            updated.markModified('data');
        }
        updated.modified = Date.now();
        updated.save(function(err, newContribution) {
            if (err) {
                console.log(err);
                return handleError(res, err);
            }
            KRecordController.createInternal({
                authorId: req.author._id,
                targetId: contribution._id,
                type: 'modified'
            });
            return res.json(200, newContribution);
        });
    });
};

// Deletes a KObject from the DB.
exports.destroy = function(req, res) {
    //not implemented yet
    res.send(500);
};

function handleError(res, err) {
    return res.send(500, err);
}