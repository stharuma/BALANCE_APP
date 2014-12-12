'use strict';

var _ = require('lodash');
var Link = require('./link.model');

// Get list of links
exports.index = function(req, res) {
    Link.find(function(err, links) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, links);
    });
};

exports.fromindex = function(req, res) {
    Link.find({
        from: req.params.id
    }, function(err, links) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, links);
    });
};

exports.toindex = function(req, res) {
    Link.find({
        to: req.params.id
    }, function(err, links) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, links);
    });
};

exports.tofromindex = function(req, res) {
    Link.find({
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

var Onviewref = require('../onviewref/onviewref.model');
// Get list of postrefs
exports.viewindex = function(req, res) {
    Onviewref.find({
        from: req.params.id
    }, function(err, refs) {
        if (err) {
            return handleError(res, err);
        }
        var ids = [];
        refs.forEach(function(ref) {
            return ids.push(ref.to);
        });
        Link.find({
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
    Link.findById(req.params.id, function(err, link) {
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
    return Link.createCash(req.body, function(link) {
        Link.create(link, function(err, link) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(201, link);
        });
    });
};

// Updates an existing link in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Link.findById(req.params.id, function(err, link) {
        if (err) {
            return handleError(res, err);
        }
        if (!link) {
            return res.send(404);
        }
        var updated = _.merge(link, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, link);
        });
    });
};

// Deletes a link from the DB.
exports.destroy = function(req, res) {
    Link.findById(req.params.id, function(err, link) {
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
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}