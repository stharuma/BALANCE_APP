'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');

var KContribution = require('./KContribution.model');
var KLink = require('../KLink/KLink.model');
var KRecordController = require('../KRecord/KRecord.controller.js');
var KLinkController = require('../KLink/KLink.controller.js');

// Creates a new contribution in the DB.
exports.create = function(req, res) {
    if (!_.contains(req.body.authors, req.author._id.toString())) {
        console.error(req.body.authors)
        console.error(req.author._id);
        console.error('author must be included in authors.');
        return res.status(403);
    }
    KContribution.create(req.body, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        KRecordController.createInternal({
            authorId: req.author._id,
            targetId: contribution._id,
            type: 'created'
        });
        if (req.body.buildson) {
            exports.createBuildsOn(res, contribution, req.body.buildson, function(err) {
                if (err) {
                    return handleError(res, err);
                }
                return res.status(201).json(contribution);
            });
            return;
        }
        return res.status(201).json(contribution);
    });
};

exports.searchCount = function(req, res) {
    makeMongoQuery(req, res, function() {
        KContribution.count(req.mongoQuery, function(err, count) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json({
                count: count
            });
        });
    });
};

exports.search = function(req, res) {
    var query = req.body.query;
    var pagesize = query.pagesize ? query.pagesize : 50;
    var page = query.page ? query.page : 1;
    var skip = pagesize * (page - 1);

    makeMongoQuery(req, res, function() {
        KContribution.find(req.mongoQuery).skip(skip).
        limit(pagesize).
        exec(function(err, contributions) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json(contributions);
        });
    });
};

function makeMongoQuery(req, res, success) {
    var query = req.body.query;
    if (!query.viewIds) {
        makeMongoQuery0(req, res, success);
    } else { //has viewIds
        KLink.find({
            from: {
                $in: query.viewIds
            }
        }, function(err, links) {
            if (err) {
                return handleError(res, err);
            }
            var ids = [];
            links.forEach(function(each) {
                if (each._from.status === 'active') {
                    ids.push(each.to);
                }
            });
            req.ids = ids;
            makeMongoQuery0(req, res, success);
        });
    }
}

function makeMongoQuery0(req, res, success) {
    var query = req.body.query;
    var communityId = query.communityId;
    if (!communityId) {
        return res.status(500).json({
            'err': 'communityId is necessary'
        });
    }

    var mongoQuery = {
        $and: []
    };
    mongoQuery.$and.push({
        communityId: communityId
    });

    mongoQuery.$and.push({
        status: 'active'
    });

    if (!query.privateMode) {
        mongoQuery.$and.push({
            permission: {
                $in: ['public', 'protected']
            }
        });
    } else { //private mode
        mongoQuery.$and.push({
            authors: mongoose.Types.ObjectId(req.author._id)
        });
    }

    if (req.ids && req.ids.length > 0) {
        mongoQuery.$and.push({
            _id: {
                $in: req.ids
            }
        });
    }

    if (query.authors && query.authors.length > 0) {
        var authorIds = [];
        query.authors.forEach(function(authorIdStr) {
            authorIds.push(mongoose.Types.ObjectId(authorIdStr));
        });
        mongoQuery.$and.push({
            authors: {
                $in: authorIds
            }
        });
    }

    if (query.from !== undefined) {
        var dateFrom = new Date(query.from);
        mongoQuery.$and.push({
            created: {
                $gte: dateFrom
            }
        });
    }

    if (query.to !== undefined) {
        var dateTo = new Date(query.to);
        mongoQuery.$and.push({
            created: {
                $lte: dateTo
            }
        });
    }

    //http://stackoverflow.com/questions/10913568/mongoose-how-to-find-3-words-in-any-order-and-in-any-place-in-the-string-sql
    //(?=.*comp)(?=.*abc)(?=.*300).*
    var regexpstr = '';
    if (query.words) {
        query.words.forEach(function(word) {
            regexpstr += '(?=.*' + word + ')';
        });
        regexpstr += '.*';
    }
    mongoQuery.$and.push({
        text4search: new RegExp(regexpstr, 'i')
    });

    req.mongoQuery = mongoQuery;
    success();
}

// not used yet
// exports.textindexSearch = function(req, res) {
//     var text = req.body.searchText;
//     Contribution.find({
//             $text: {
//                 $search: text
//             }
//         }
//         // , {
//         //         score: {
//         //             $meta: 'textScore'
//         //         },
//         //         title: 1,
//         //         body: 1,
//         //         type: 1
//         //     }).
//         //     sort({
//         //         score: {
//         //             $meta: 'textScore'
//         //         }
//         //     }
//     ).
//     limit(10).
//     exec(function(err, posts) {
//         if (err) {
//             return handleError(res, err);
//         }
//         return res.json(200, posts);
//     });
// };

// this method is painful
exports.createBuildsOn = function(res, note, buildsonId, handler) {
    var seed = {
        communityId: note.communityId,
        from: note._id,
        to: buildsonId,
        type: 'buildson'
    };
    KLinkController.checkAndCreate(seed, function(err, link) {
        if (err) {
            if (handler) {
                handler(err);
            }
            return;
        }
        KLink.find({
                to: link.to,
                type: 'contains'
            },
            function(err, refs) {
                if (err) {
                    console.error(err);
                    return;
                }
                refs.forEach(function(ref) {
                    var newref = {
                        from: ref.from,
                        to: link.from,
                        type: 'contains',
                        data: {
                            x: ref.data.x + 50,
                            y: ref.data.y + 50
                        }
                    };
                    KLinkController.checkAndCreate(newref, function(err, newref) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                });
            });
        if (handler) {
            handler(err, link);
        }
        return;
    });
};

function handleError(res, err) {
    console.error(err);
    return res.send(500, err);
}