'use strict';

var _ = require('lodash');
var KLink = require('../KLink/KLink.model');
var Notification = require('./notification.model');
var kfmail = require('../../components/kfmail/kfmail.js');

function push(email, content) {
    if (email) {
        kfmail.send(email, '[KF6 notification]', body);
    }
}

exports.notify = function(req, res) {
    var contextId = req.body.contextId;
    KLink.find({
        from: contextId,
        type: 'notifies'
    }, function(err, links) {
        if (err) {
            console.error(err);
            return;
        }
        links.forEach(function(link) {
            var email = link._to.email;
            if (email) {
                push(email, req.body)
            }
        });
    });
    res.send(200);
}

function handleError(res, err) {
    return res.send(500, err);
}
