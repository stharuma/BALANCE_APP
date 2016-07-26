'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');

var KCommunity = require('./KCommunity.model');
var KContribution = require('../KContribution/KContribution.model');
var KAuthor = require('../KAuthor/KAuthor.model');
var KGroup = require('../KGroup/KGroup.model');

// Get list of communitys
exports.index = function(req, res) {
    KCommunity.find(function(err, communitys) {
        if (err) {
            return handleError(res, err);
        }
        return res.status(200).json(communitys);
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
        communityId: req.params.id,
        status: 'active'
    }, function(err, authors) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(authors);
    });
};

// Get groups of the community
exports.showgroups = function(req, res) {
    KGroup.find({
        communityId: req.params.id,
        status: 'active'
    }, function(err, groups) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(groups);
    });
};

// Creates a new community in the DB.
exports.create = function(req, res) {
    KCommunity.create(req.body, function(err, community) {
        if (err) {
            return handleError(res, err);
        }

        KAuthor.createAuthor(community, 'manager', req.user, function(author) {
            return res.status(201).json(community);
        }, function(err) {
            return handleError(res, err);
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
        delete req.body.__v; /* this allows consective updating */
        var titleChanged = community.title !== req.body.title;
        var updated = _.merge(community, req.body);
        updated.views = req.body.views;
        updated.markModified('views');
        updated.scaffolds = req.body.scaffolds;
        updated.markModified('scaffolds');
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            //update community names for every author{
            if (titleChanged) {
                KAuthor.find({ communityId: community._id }, function(err, authors) {
                    if (err) {
                        return;
                    }
                    authors.forEach(function(author) {
                        author._community = updated;
                        author.save();
                    });
                });
            }
            //}
            return res.status(200).json(community);
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
    console.error(err);
    return res.send(500, err);
}
