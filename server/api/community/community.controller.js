'use strict';

var _ = require('lodash');
var Community = require('./community.model');
var Contribution = require('../contribution/contribution.model');
var Link = require('../link/link.model');

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

// Creates a new community in the DB.
exports.create = function(req, res) {
    Community.create(req.body, function(err, community) {
        if (err) {
            return handleError(res, err);
        }

        //return res.json(201, community);
        return exports.createScaffold(req, res, community);
    });
};

exports.createScaffold = function(req, res, community) {
    Contribution.create({
        communityId: community._id,
        title: 'Knowledge Building',
        type: 'Scaffold'
    }, {
        communityId: community._id,
        title: 'My Theory',
        type: 'Support'
    }, {
        communityId: community._id,
        title: 'I need to understand',
        type: 'Support'
    }, {
        communityId: community._id,
        title: 'Science Learning',
        type: 'Scaffold'
    }, {
        communityId: community._id,
        title: 'My Hypothesis',
        type: 'Support'
    }, {
        communityId: community._id,
        title: 'Result of examination',
        type: 'Support'
    }, function(err, s1, s11, s12, s2, s21, s22) {
        community.scaffolds = [s1._id, s2._id];
        community.save(function(err) {
            Link.createWithCash({
                from: s1._id,
                to: s11,
                type: 'contains'
            });
            Link.createWithCash({
                from: s1._id,
                to: s12,
                type: 'contains'
            });
            Link.createWithCash({
                from: s2._id,
                to: s21,
                type: 'contains'
            });
            Link.createWithCash({
                from: s2._id,
                to: s22,
                type: 'contains'
            });
            return res.json(201, community);
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