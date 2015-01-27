'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var Registration = require('./registration.model');
var Community = require('../community/community.model');

// Get list of registrations
exports.index = function(req, res) {
    Registration.find(function(err, registrations) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, registrations);
    });
};

// Get a single registration
exports.show = function(req, res) {
    Registration.findById(req.params.id, function(err, registration) {
        if (err) {
            return handleError(res, err);
        }
        if (!registration) {
            return res.send(404);
        }
        return res.json(registration);
    });
};

exports.showByCommunityUser = function(req, res) {
    var communityId = mongoose.Types.ObjectId(req.params.communityId);
    var authorId = mongoose.Types.ObjectId(req.params.authorId);
    Registration.find({
        communityId: communityId,
        authorId: authorId
    }, function(err, registrations) {
        if (err) {
            return handleError(res, err);
        }
        if (!registrations) {
            return res.send(404);
        }
        return res.json(registrations);
    });
};

// Creates a new registration in the DB.
exports.create = function(req, res) {
    var communityId = mongoose.Types.ObjectId(req.body.communityId);
    var authorId = mongoose.Types.ObjectId(req.body.authorId);

    if (authorId.toString() !== req.user._id.toString()) {
        return res.send(400, 'Illegal Authentication: authorId and authorIdByAuth are different.');
    }

    //check key
    Community.findById(communityId, function(err, community) {
        if (err) {
            return handleError(res, err);
        }

        if (community.registrationKey !== req.body.registrationKey) {
            return res.send(400, 'RegistrationKey does not match.');
        }

        //check if already registered
        Registration.find({
            communityId: communityId,
            authorId: authorId
        }, function(err, regs) {
            if (err) {
                return handleError(res, err);
            }

            if (regs.length > 0) {
                return res.send(400, 'You have already registered.'); //already exists
            }

            Registration.create(req.body, function(err, registration) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json(201, registration);
            });
        });
    });
};

// Updates an existing registration in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Registration.findById(req.params.id, function(err, registration) {
        if (err) {
            return handleError(res, err);
        }
        if (!registration) {
            return res.send(404);
        }
        var updated = _.merge(registration, req.body);
        updated.workspaces = req.body.workspaces;
        updated.markModified('workspaces');
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, registration);
        });
    });
};

// Deletes a registration from the DB.
exports.destroy = function(req, res) {
    Registration.findById(req.params.id, function(err, registration) {
        if (err) {
            return handleError(res, err);
        }
        if (!registration) {
            return res.send(404);
        }
        registration.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}