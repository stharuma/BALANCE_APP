'use strict';

var _ = require('lodash');
var KAuthor = require('./KAuthor.model');

var mongoose = require('mongoose');
var Community = require('../community/community.model');

// Get list of KAuthors
exports.index = function(req, res) {
    KAuthor.find(function(err, KAuthors) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, KAuthors);
    });
};

// Get a single KAuthor
exports.show = function(req, res) {
    KAuthor.findById(req.params.id, function(err, KAuthor) {
        if (err) {
            return handleError(res, err);
        }
        if (!KAuthor) {
            return res.send(404);
        }
        return res.json(KAuthor);
    });
};

/**
 * Get my info
 */
exports.me = function(req, res) {
    return res.json(req.author);
};

// Creates a new registration in the DB.
exports.create = function(req, res) {
    var communityId = mongoose.Types.ObjectId(req.body.communityId);
    var userId = mongoose.Types.ObjectId(req.body.userId);

    if (userId.toString() !== req.user._id.toString()) {
        return res.send(400, 'Illegal Authentication: userId and userIdByAuth are different.');
    }

    //check key
    Community.findById(communityId, function(err, community) {
        if (err) {
            return handleError(res, err);
        }

        var role = '';
        if (community.registrationKey === req.body.registrationKey) {
            role = 'writer';
        } else if (community.managerRegistrationKey === req.body.registrationKey) {
            role = 'manager';
        } else {
            return res.send(400, 'RegistrationKey does not match.');
        }

        //check if already registered
        KAuthor.find({
            communityId: communityId,
            userId: userId
        }, function(err, authors) {
            if (err) {
                return handleError(res, err);
            }

            if (authors.length > 0) {
                return res.send(400, 'You have already registered.'); //already exists
            }

            req.body.communityId = communityId;
            req.body.type = 'Author';
            req.body.role = role;
            req.body.firstName = req.user.firstName;
            req.body.lastName = req.user.lastName;
            req.body._community = {
                title: community.title,
                created: community.created
            };
            req.body._user = req.user.profile;
            KAuthor.create(req.body, function(err, author) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json(201, author);
            });
        });
    });
};

// Updates an existing KAuthor in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    KAuthor.findById(req.params.id, function(err, KAuthor) {
        if (err) {
            return handleError(res, err);
        }
        if (!KAuthor) {
            return res.send(404);
        }
        var updated = _.merge(KAuthor, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, KAuthor);
        });
    });
};

// Deletes a KAuthor from the DB.
exports.destroy = function(req, res) {
    KAuthor.findById(req.params.id, function(err, KAuthor) {
        if (err) {
            return handleError(res, err);
        }
        if (!KAuthor) {
            return res.send(404);
        }
        KAuthor.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    console.log(err);
    return res.send(500, err);
}