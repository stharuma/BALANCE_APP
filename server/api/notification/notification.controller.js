'use strict';

var _ = require('lodash');
var Notification = require('./notification.model');
var kfmail = require('../../components/kfmail/kfmail.js');

exports.notify = function(req, res) {
    //console.log(author);
    //console.log(contribution);
    //  exports.send(to, subject, body);
}

// exports.notify = function(req, res) {
//   Notification.find(function (err, notifications) {
//     if(err) { return handleError(res, err); }
//     return res.json(200, notifications);
//   });
// };

function handleError(res, err) {
    return res.send(500, err);
}
