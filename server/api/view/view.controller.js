'use strict';

var _ = require('lodash');
var View = require('./view.model');

// Get list of views
exports.index = function(req, res) {
    var communityId = req.params.communityId;
    View.find({
        communityId: communityId
    }, function(err, views) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, views);
    });
};

// Creates a new view in the DB.
exports.create = function(req, res) {
    req.body.type = 'View';
    View.create(req.body, function(err, view) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, view);
    });
};

function handleError(res, err) {
    return res.send(500, err);
}