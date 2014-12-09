'use strict';

var _ = require('lodash');
var Record = require('./record.model');

var Onviewref = require('../onviewref/onviewref.model');
var mongoose = require('mongoose');

exports.read = function(req, res) {
    Record.create({
            authorId: req.user._id,
            targetId: req.params.contributionId,
            type: 'read'
        },
        function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, {});
        });
};

exports.count = function(req, res) {
    Onviewref.find({
        viewId: req.params.viewId
    }, function(err, refs) {
        if (err) {
            return handleError(res, err);
        }
        var ids = [];
        for (var i = 0; i < refs.length; i++) {
            ids.push(refs[i].contributionId);
        }
        var uid = mongoose.Types.ObjectId(req.params.authorId);
        Record.aggregate([{
                $match: {
                    $and: [{
                        authorId: uid
                    }, {
                        type: "read"
                    }, {
                        targetId: {
                            $in: ids
                        }
                    }]
                }
            }, {
                $group: {
                    _id: "$targetId",
                    counts: {
                        $sum: 1
                    }
                }
            }],
            function(err, records) {
                return res.json(200, records);
            });
    });
};

// Get list of records
exports.index = function(req, res) {
    Record.find(function(err, records) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, records);
    });
};

// Get a single record
exports.show = function(req, res) {
    Record.findById(req.params.id, function(err, record) {
        if (err) {
            return handleError(res, err);
        }
        if (!record) {
            return res.send(404);
        }
        return res.json(record);
    });
};

// Creates a new record in the DB.
exports.create = function(req, res) {
    Record.create(req.body, function(err, record) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, record);
    });
};

// Updates an existing record in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Record.findById(req.params.id, function(err, record) {
        if (err) {
            return handleError(res, err);
        }
        if (!record) {
            return res.send(404);
        }
        var updated = _.merge(record, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, record);
        });
    });
};

// Deletes a record from the DB.
exports.destroy = function(req, res) {
    Record.findById(req.params.id, function(err, record) {
        if (err) {
            return handleError(res, err);
        }
        if (!record) {
            return res.send(404);
        }
        record.remove(function(err) {
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