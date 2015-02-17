'use strict';

var _ = require('lodash');
var KRecord = require('./KRecord.model');

var KObject = require('../KObject/KObject.model');
var KLink = require('../KLink/KLink.model');
var mongoose = require('mongoose');

exports.read = function(req, res) {
    exports.createInternal({
            authorId: req.author._id,
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
    KLink.find({
        from: req.params.viewId
    }, function(err, refs) {
        if (err) {
            return handleError(res, err);
        }
        var ids = [];
        for (var i = 0; i < refs.length; i++) {
            ids.push(refs[i].to);
        }
        var uid = mongoose.Types.ObjectId(req.author._id);
        KRecord.aggregate([{
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

exports.index = function(req, res) {
    KRecord.find({
        targetId: req.params.objectId
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

// Get a single record
exports.show = function(req, res) {
    KRecord.findById(req.params.id, function(err, record) {
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
    exports.createInternal(req.body, function(err, record) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, record);
    });
};

exports.createInternal = function(seed, handler) {
    if (seed.communityId) {
        KRecord.create(seed, handler);
    } else {
        KObject.findById(seed.targetId, function(err, object) {
            if (err) {
                if (handler) {
                    handler(err);
                }
                return;
            }
            seed.communityId = object.communityId;
            KRecord.create(seed, handler);
        });
    }
};

function handleError(res, err) {
    return res.send(500, err);
}