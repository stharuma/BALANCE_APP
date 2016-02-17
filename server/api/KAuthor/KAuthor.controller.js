'use strict';

var _ = require('lodash');
var KAuthor = require('./KAuthor.model');

var mongoose = require('mongoose');
var KCommunity = require('../KCommunity/KCommunity.model');

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
    KCommunity.findById(communityId, function(err, community) {
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

            KAuthor.createAuthor(community, role, req.user,
                function(author) {
                    return res.status(201).json(author);
                },
                function(err) {
                    return handleError(res, err);
                });
        });
    });
};

function handleError(res, err) {
    console.error(err);
    return res.send(500, err);
}