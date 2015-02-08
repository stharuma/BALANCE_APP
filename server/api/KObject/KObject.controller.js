'use strict';

var _ = require('lodash');
var KObject = require('./KObject.model');

// Get list of KObjects
exports.index = function(req, res) {
    KObject.find(function(err, KObjects) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, KObjects);
    });
};

// Get a single KObject
exports.show = function(req, res) {
    KObject.findById(req.params.id, function(err, KObject) {
        if (err) {
            return handleError(res, err);
        }
        if (!KObject) {
            return res.send(404);
        }
        return res.json(KObject);
    });
};

// Creates a new KObject in the DB.
exports.create = function(req, res) {
    KObject.create(req.body, function(err, KObject) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, KObject);
    });
};

// Updates an existing KObject in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    KObject.findById(req.params.id, function(err, KObject) {
        if (err) {
            return handleError(res, err);
        }
        if (!KObject) {
            return res.send(404);
        }
        var updated = _.merge(KObject, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, KObject);
        });
    });
};

// Deletes a KObject from the DB.
exports.destroy = function(req, res) {
    KObject.findById(req.params.id, function(err, KObject) {
        if (err) {
            return handleError(res, err);
        }
        if (!KObject) {
            return res.send(404);
        }
        KObject.remove(function(err) {
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