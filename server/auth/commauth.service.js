'use strict';

var compose = require('composable-middleware');
var auth = require('./auth.service');
var KAuthor = require('../api/KAuthor/KAuthor.model');

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

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;