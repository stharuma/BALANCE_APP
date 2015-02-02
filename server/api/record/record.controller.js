'use strict';

var _ = require('lodash');
var Record = require('./record.model');

var Contribution = require('../contribution/contribution.model');
var Link = require('../link/link.model');
var mongoose = require('mongoose');

exports.read = function(req, res) {
    exports.createInternal({
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
    Link.find({
        from: req.params.viewId
    }, function(err, refs) {
        if (err) {
            return handleError(res, err);
        }
        var ids = [];
        for (var i = 0; i < refs.length; i++) {
            ids.push(refs[i].to);
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
    //shuold not be used
    return res.json(200, []);
};

exports.indexOfContribution = function(req, res) {
    Record.find({
        targetId: req.params.contributionId
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
    exports.createInternal(req.body, function(err, record) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, record);
    });
};

exports.createInternal = function(seed, handler) {
    if (seed.communityId) {
        Record.create(seed, handler);
    } else {
        Contribution.findById(seed.targetId, function(err, contribution) {
            if (err) {
                if (handler) {
                    handler(err);
                }
                return;
            }
            seed.communityId = contribution.communityId;
            Record.create(seed, handler);
        });
    }
};

function handleError(res, err) {
    return res.send(500, err);
}