'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var Community = require('./community.model');
var Contribution = require('../contribution/contribution.model');
var Link = require('../link/link.model');
var Registration = require('../registration/registration.model');
var User = require('../user/user.model');

// Get list of communitys
exports.index = function(req, res) {
    Community.find(function(err, communitys) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, communitys);
    });
};

// Get a single community
exports.show = function(req, res) {
    Community.findById(req.params.id, function(err, community) {
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
    Community.findById(req.params.id, function(err, community) {
        if (err) {
            return handleError(res, err);
        }
        if (!community) {
            return res.send(404);
        }
        var ids = community.views;
        Contribution.find({
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
    Registration.find({
        communityId: req.params.id
    }, function(err, registrations) {
        if (err) {
            return handleError(res, err);
        }
        var ids = toIds(registrations, 'authorId');
        User.find({
            '_id': {
                $in: ids
            }
        }, function(err, objects) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(objects);
        });
    });
};

exports.myindex = function(req, res) {
    Registration.find({
        authorId: req.user._id
    }, function(err, registrations) {
        if (err) {
            return handleError(res, err);
        }
        var ids = toIds(registrations, 'communityId');
        Community.find({
            '_id': {
                $in: ids
            }
        }, function(err, objects) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(objects);
        });
    });
};

// Creates a new community in the DB.
exports.create = function(req, res) {
    Community.create(req.body, function(err, community) {
        if (err) {
            return handleError(res, err);
        }

        //return res.json(201, community);
        exports.createView(req, res, community, function() {
            exports.createScaffold(req, res, community);
        });
    });
};

exports.createView = function(req, res, community, handler) {
    Contribution.create({
        communityId: community._id,
        title: 'Welcome',
        type: 'View'
    }, function(err, view) {
        community.views.push(view._id);
        community.save(function(err) {
            if (handler) {
                handler();
            }
        });
    });
};

exports.createScaffold = function(req, res, community) {
    Contribution.create({
        communityId: community._id,
        title: 'Theory Building',
        type: 'Scaffold'
    }, {
        communityId: community._id,
        title: 'My theory',
        type: 'Support'
    }, {
        communityId: community._id,
        title: 'A better theory',
        type: 'Support'
    }, {
        communityId: community._id,
        title: 'New information',
        type: 'Support'
    }, {
        communityId: community._id,
        title: 'This theory cannot explain',
        type: 'Support'
    }, {
        communityId: community._id,
        title: 'I need to understand',
        type: 'Support'
    }, {
        communityId: community._id,
        title: 'Putting our knowledge together',
        type: 'Support'
    }, function(err, sc1, s1, s2, s3, s4, s5, s6) {
        community.scaffolds = [sc1._id];
        var supports = [s1, s2, s3, s4, s5, s6];
        community.save(function(err) {
            supports.forEach(function(each) {
                Link.createWithCash({
                    from: sc1._id,
                    to: each._id,
                    type: 'contains'
                });
                return res.json(201, community);
            });
        });
    });
};

// Updates an existing community in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Community.findById(req.params.id, function(err, community) {
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
    Community.findById(req.params.id, function(err, community) {
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
    return res.send(500, err);
}