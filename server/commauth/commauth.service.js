'use strict';

var compose = require('composable-middleware');
var CommunitySession = require('./commauth.model');

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
    return compose()
        .use(function(req, res, next) {
            CommunitySession.findById(req.headers.authorization, function(err, session) {
                if (err) {
                    return next(err);
                }
                if (!session) {
                    return res.send(401);
                }

                req.author = session.author;
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