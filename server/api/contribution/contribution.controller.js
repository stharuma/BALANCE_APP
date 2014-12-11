'use strict';

var _ = require('lodash');
var Contribution = require('./contribution.model');

var Record = require('../record/record.model');

// Get list of contributions
exports.index = function(req, res) {
    Contribution.find(function(err, contributions) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, contributions);
    });
};

// Get a single contribution
exports.show = function(req, res) {
    Contribution.findById(req.params.id, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        if (!contribution) {
            return res.send(404);
        }
        return res.json(contribution);
    });
};

// Creates a new contribution in the DB.
exports.create = function(req, res) {
    Contribution.create(req.body, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, contribution);
    });
};

// Updates an existing contribution in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
        delete req.body.__v; /* by using this, we can avoid conflict of editing multi users*/
    }
    Contribution.findById(req.params.id, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        if (!contribution) {
            return res.send(404);
        }
        var updated = _.merge(contribution, req.body);
        updated.authors = req.body.authors;
        updated.markModified('authors');
        updated.save(function(err) {
            if (err) {
                console.log(err);
                return handleError(res, err);
            }
            Record.create({
                authorId: req.user._id,
                targetId: contribution._id,
                type: 'update'
            });
            //exports.updateRefs(contribution);
            return res.json(200, contribution);
        });
    });
};



// Deletes a contribution from the DB.
exports.destroy = function(req, res) {
    Contribution.findById(req.params.id, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        if (!contribution) {
            return res.send(404);
        }
        contribution.remove(function(err) {
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

exports.showrecords = function(req, res) {
    Record.find({
        targetId: req.params.id
    }, function(err, records) {
        if (err) {
            return handleError(res, err);
        }
        if (!records) {
            return res.send(404);
        }
        return res.json(records);
    });
};

exports.upload = function(req, res) {
    return res.json(200, req.files);
};