'use strict';

var _ = require('lodash');
var Onviewref = require('./onviewref.model');

// Get list of onviewrefs
exports.index = function(req, res) {
    Onviewref.find(function(err, onviewrefs) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, onviewrefs);
    });
};

// Get list of onviewrefs
exports.indexByView = function(req, res) {
    Onviewref.find({
        from: req.params.viewId
    }, function(err, refs) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, refs);
    });
};

// Get a single onviewref
exports.show = function(req, res) {
    Onviewref.findById(req.params.id, function(err, onviewref) {
        if (err) {
            return handleError(res, err);
        }
        if (!onviewref) {
            return res.send(404);
        }
        return res.json(onviewref);
    });
};

// Creates a new onviewref in the DB.
exports.create = function(req, res) {
    Onviewref.create(req.body, function(err, onviewref) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, onviewref);
    });
};

// Updates an existing onviewref in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Onviewref.findById(req.params.id, function(err, onviewref) {
        if (err) {
            return handleError(res, err);
        }
        if (!onviewref) {
            return res.send(404);
        }
        var updated = _.merge(onviewref, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, onviewref);
        });
    });
};

// Deletes a onviewref from the DB.
exports.destroy = function(req, res) {
    Onviewref.findById(req.params.id, function(err, onviewref) {
        if (err) {
            return handleError(res, err);
        }
        if (!onviewref) {
            return res.send(404);
        }
        onviewref.remove(function(err) {
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