'use strict';

var _ = require('lodash');
var KObject = require('./KObject.model');
var KRecordController = require('../KRecord/KRecord.controller.js');
var KHistoricalObject = require('../KHistoricalObject/KHistoricalObject.model.js');
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
    if (!_.contains(req.body.authors, req.author._id.toString())) {
        console.error('author must be included in authors.');
        return res.json(403);
    }
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

        // exceptional case restriction
        if (contribution.type === 'Author' && contribution.role !== newobj.role && req.author.role !== 'manager') {
            return res.send(403);
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
        if (newobj.members) {
            updated.members = newobj.members;
            updated.markModified('members');
        }
        if (newobj.data) {
            updated.markModified('data');
        }
        /* bridge program: old user does not have userName which cannot update (e.g. workspace creation problem caused by this) */
        if (updated.__t === 'KAuthor' && !updated.userName) {
            updated.userName = req.user.email;
        }
        /* bridge program end */

        updated.modified = Date.now();
        if (updated.group !== newobj.group) {
            updated._groupMembers = null;
        }
        updated.save(function(err, newContribution) {
            if (err) {
                return handleError(res, err);
            }
            KHistoricalObject.createByObject(newContribution, function(err, historical) {
                if (err) {
                    return handleError(res, err);
                }
                KRecordController.createInternal({
                    authorId: req.author._id,
                    targetId: contribution._id,
                    type: 'modified',
                    historicalObjectType: 'Object',
                    historicalObjectId: historical._id
                });
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
    console.error(err);
    return res.send(500, err);
}