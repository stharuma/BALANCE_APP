'use strict';

var Registration = require('../api/registration/registration.model');
var CommunitySession = require('./commauth.model');

// Get list of kfauths
exports.login = function(req, res) {
    var authorId = req.body.authorId
    Registration.findById(authorId, function(err, author) {
        if (err) {
            return handleError(res, err);
        }
        if (!author) {
            return handleError(res, 'not found:' + authorId);
        }
        
        var session = {};
        session.token = req.headers.authorization;
        session.author = author;

        CommunitySession.findOneAndUpdate({
                token: session.token
            }, session, {
                upsert: true
            },
            function(err, session) {
                if (err) {
                    return handleError(res, err);
                }
                return res.send(200);
            });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}