'use strict';

var compose = require('composable-middleware');
var auth = require('./auth.service');
var KAuthor = require('../api/KAuthor/KAuthor.model');
var KObject = require('../api/KObject/KObject.model');
var KLink = require('../api/KLink/KLink.model');

function isLinkAuthenticatedById() {
    return compose()
        .use(function(req, res, next) {
            if (!req.params.id) {
                return res.send(500, 'id param not found');
            }
            KLink.findById(req.params.id, function(err, link) {
                if (err) {
                    return res.send(500, err);
                }
                if (!link) {
                    return res.send(500, 'link not found');
                }
                if (!req.body) {
                    req.body = {};
                }
                req.body.from = link.from;
                req.body.to = link.to;
                next();
            });
        })
        .use(isLinkAuthenticated());
}

function isLinkAuthenticated() {
    return compose()
        .use(auth.isAuthenticated())
        .use(function(req, res, next) {
            if (!req.body.from) {
                return res.send(500, 'from field not found');
            }
            KObject.findById(req.body.from, function(err, obj) {
                if (err) {
                    return res.send(500, err);
                }
                req.from = obj;
                req.params.communityId = obj.communityId;
                next();
            });
        })
        .use(function(req, res, next) {
            if (!req.body.to) {
                return res.send(500, 'to field not found');
            }
            KObject.findById(req.body.to, function(err, obj) {
                if (err) {
                    return res.send(500, err);
                }
                req.to = obj;
                next();
            });
        })
        .use(isAuthenticated());
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 401
 */
function isAuthenticated() {
    return compose()
        .use(auth.isAuthenticated())
        .use(function(req, res, next) {
            var user = req.user;
            /* assert user is not null */
            var communityId = req.params.communityId;
            if (!communityId) {
                return res.send(401, 'communityId not found.');
            }

            KAuthor.findOne({
                communityId: communityId,
                userId: user._id
            }, function(err, author) {

                if (err) {
                    return res.send(500, err);
                }
                if (!author) {
                    return res.send(401, 'author not found.');
                }

                req.author = author;
                next();
            });
        });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
    if (!roleRequired) throw new Error('Required role needs to be set');

    return compose()
        .use(isAuthenticated())
        .use(function meetsRequirements(req, res, next) {
            if (req.author.role === roleRequired) {
                next();
            } else {
                res.send(403);
            }
        });
}

exports.isLinkAuthenticatedById = isLinkAuthenticatedById;
exports.isLinkAuthenticated = isLinkAuthenticated;
exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;