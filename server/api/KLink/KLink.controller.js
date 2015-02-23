'use strict';

var _ = require('lodash');
var KLink = require('./KLink.model');
var KObject = require('../KObject/KObject.model');
var KRecordController = require('../KRecord/KRecord.controller.js');
var KHistoricalObject = require('../KHistoricalObject/KHistoricalObject.model.js');

exports.index = function(req, res) {
    //this should not be used
    res.json(200, []);
};

exports.fromIndex = function(req, res) {
    KLink.find({
        from: req.params.id
    }, function(err, links) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, links);
    });
};

exports.toIndex = function(req, res) {
    KLink.find({
        to: req.params.id
    }, function(err, links) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, links);
    });
};

exports.eitherIndex = function(req, res) {
    KLink.find({
        $or: [{
            from: req.params.id
        }, {
            to: req.params.id
        }]
    }, function(err, links) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, links);
    });
};

// Get links between contributions on view
exports.viewIndex = function(req, res) {
    KLink.find({
        from: req.params.id,
        type: 'contains'
    }, function(err, refs) {
        if (err) {
            return handleError(res, err);
        }
        var ids = [];
        refs.forEach(function(ref) {
            return ids.push(ref.to);
        });
        KLink.find({
            $or: [{
                from: {
                    $in: ids
                }
            }, {
                to: {
                    $in: ids
                }
            }]
        }, function(err, links) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, links);
        });
    });
};

// Get a single link
exports.show = function(req, res) {
    KLink.findById(req.params.id, function(err, link) {
        if (err) {
            return handleError(res, err);
        }
        if (!link) {
            return res.send(404);
        }
        return res.json(link);
    });
};

exports.create = function(req, res) {
    var seed = req.body;
    exports.checkAndCreate(seed, function(err, link) {
        if (err) {
            return handleError(res, err);
        }
        record(req, link, 'created');
        return res.json(201, link);
    });
};

exports.checkAndCreate = function(seed, handler) {
    checkAndPrepareSeed(seed, function(err) {
        if (err) {
            if (handler) {
                handler(err);
            }
            return;
        }
        KLink.create(seed, function(err, link) {
            if (handler) {
                handler(err, link);
            }
            return;
        });
    });
};

function checkAndPrepareSeed(seed, handler) {
    getFromToContributions(seed.from, seed.to, function(from, to) {
        if (!seed.type) {
            return handler("no seed type." + seed);
        }
        if (!from || !to) {
            return handler("missing link in seed: " + JSON.stringify(seed));
        }
        if (!seed.communityId) {
            seed.communityId = from.communityId;
            console.info('communityId missing automatically complimented:' + seed);
        }
        if (from.communityId.toString() !== to.communityId.toString()) {
            return handler('from.communityId !== to.communityId');
        }
        if (seed.communityId.toString() !== from.communityId.toString()) {
            return handler('seed.communityId !== from.communityId');
        }
        if (seed.communityId.toString() !== to.communityId.toString()) {
            return handler('seed.communityId !== from.communityId');
        }
        seed._from = KLink.createCashObj(from);
        seed._to = KLink.createCashObj(to);
        return handler(); //OK
    });
}

function getFromToContributions(fromId, toId, handler) {
    KObject.findById(fromId, function(err, from) {
        KObject.findById(toId, function(err, to) {
            handler(from, to);
        });
    });
}

// Updates an existing link in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    KLink.findById(req.params.id, function(err, link) {
        if (err) {
            return handleError(res, err);
        }
        if (!link) {
            return res.send(404);
        }

        var updated = _.merge(link, req.body);
        updated.modified = Date.now();
        if (req.body.data) {
            updated.markModified('data');
        }
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            record(req, link, 'modified');
            return res.json(200, link);
        });
    });
};

// Deletes a link from the DB.
exports.destroy = function(req, res) {
    KLink.findById(req.params.id, function(err, link) {
        if (err) {
            return handleError(res, err);
        }
        if (!link) {
            return res.send(404);
        }
        link.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            record(req, link, 'deleted');
            return res.send(204);
        });
    });
};

function record(req, link, operationType) {
    if (!req.author) {
        console.error('req.author not found.');
        return;
    }
    KHistoricalObject.createByLink(link, function(err, historical) {
        if (err) {
            console.error(err);
            return;
        }
        KRecordController.createInternal({
            authorId: req.author._id,
            targetId: link.from,
            type: 'modified',
            historicalObjectType: 'Link',
            historicalVariableName: link.type,
            historicalOperationType: operationType,
            historicalObjectId: historical._id
        });
    });
}

// ----- cache remaking function ------
// ----- cache remaking is unnecessary in normal usage ------

// Get a single link
exports.updateAllCash = function(req, res) {
    KLink.update({
        communityId: req.params.communityId,
    }, {
        $set: {
            _to: null
        }
    }, {
        upsert: false,
        multi: true
    }, function(err, x) {
        if (err) {
            return handleError(res, err);
        }
        exports.updateAllCashRec(req, res);
    });
}

exports.updateAllCashRec = function(req, res) {
    var query = KLink.find({
        communityId: req.params.communityId,
        _to: null
    }).limit(5000);
    query.exec(function(err, links) {
        if (err) {
            return handleError(res, err);
        }
        var len = links.length;
        console.info(len + ' links to update!');
        if (len <= 0) {
            console.info('no links to update!');
            return res.send(200);
        }
        var numFinished = 0;
        links.forEach(function(link) {
            updateCash(link, function() {
                numFinished++;
                if (numFinished >= len) {
                    exports.updateAllCashRec(req, res);
                }
            });
        });
    });
};

function updateCash(link, handler) {
    getFromToContributions(link.from, link.to, function(from, to) {
        if (from === null || to === null) {
            showMissingLinkMsg(link, from, to);
            link._from = 'missing';
            link._to = 'missing';
            return link.save(handler);
        }
        link._from = KLink.createCashObj(from);
        link.markModified('_from');
        link._to = KLink.createCashObj(to);
        link.markModified('_to');
        return link.save(handler);
    });
}

function showMissingLinkMsg(link, fromObj, toObj) {
    var msg = 'missinglink';
    msg += ', type=' + link.type;
    msg += ', from=' + link.from;
    if (fromObj) {
        msg += ', fromType=' + fromObj.type;
    }
    msg += ', to=' + link.to;
    if (toObj) {
        msg += ', toType=' + toObj.type;
    }
    console.warn(msg);
}

//--------------------------------------------
function handleError(res, err) {
    console.error(err);
    return res.send(500, err);
}