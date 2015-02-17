'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');

var KCommunity = require('./KCommunity.model');
var KContribution = require('../KContribution/KContribution.model');
var KAuthor = require('../KAuthor/KAuthor.model');

// Get list of communitys
exports.index = function(req, res) {
    KCommunity.find(function(err, communitys) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, communitys);
    });
};

// Get a single community
exports.show = function(req, res) {
    KCommunity.findById(req.params.id, function(err, community) {
        if (err) {
            return handleError(res, err);
        }
        if (!community) {
            return res.send(404);
        }
        return res.json(community);
    });
};

// Get views of the community
exports.showviews = function(req, res) {
    KCommunity.findById(req.params.id, function(err, community) {
        if (err) {
            return handleError(res, err);
        }
        if (!community) {
            return res.send(404);
        }
        var ids = community.views;
        KContribution.find({
            '_id': {
                $in: ids
            }
        }, function(err, views) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(views);
        });
    });
};

function toIds(array, paramName) {
    var ids = [];
    array.forEach(function(each) {
        var id = mongoose.Types.ObjectId(each[paramName]);
        ids.push(id);
    });
    return ids;
}

// Get authors of the community
exports.showauthors = function(req, res) {
    KAuthor.find({
        communityId: req.params.id
    }, function(err, authors) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(authors);
    });
};

// Creates a new community in the DB.
exports.create = function(req, res) {
    KCommunity.create(req.body, function(err, community) {
        if (err) {
            return handleError(res, err);
        }

        var author = {};
        author.communityId = community._id;
        author.userId = req.user._id;
        author.type = 'Author';
        author.role = 'manager';
        author.firstName = req.user.firstName;
        author.lastName = req.user.lastName;
        author._community = {
            title: community.title,
            created: community.created
        };
        KAuthor.create(author, function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(201, community);
        });
    });
};

// Updates an existing community in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    KCommunity.findById(req.params.id, function(err, community) {
        if (err) {
            return handleError(res, err);
        }
        if (!community) {
            return res.send(404);
        }
        var updated = _.merge(community, req.body);
        updated.views = req.body.views;
        updated.markModified('views');
        updated.scaffolds = req.body.scaffolds;
        updated.markModified('scaffolds');
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, community);
        });
    });
};

// Deletes a community from the DB.
exports.destroy = function(req, res) {
    KCommunity.findById(req.params.id, function(err, community) {
        if (err) {
            return handleError(res, err);
        }
        if (!community) {
            return res.send(404);
        }
        community.remove(function(err) {
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