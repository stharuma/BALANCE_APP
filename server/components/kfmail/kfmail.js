'use strict';

var setting = require('./setting.js');
var nodemailer = require('nodemailer');

exports.sendNotification = function(to, subject, body) {
    var smtp = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: setting.user,
            pass: setting.pass
        }
    });
    var options = {
        from: setting.from,
        to: to,
        subject: subject,
        text: body
    };
    smtp.sendMail(options, function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + res.message);
        }
        smtp.close();
    });
}
