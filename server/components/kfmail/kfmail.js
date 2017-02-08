'use strict';

try {
    var setting = require('./setting.js.sample');
    var enabled = true;
} catch (e) {
    var enabled = false;
    if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        console.warn('The file kfmail/setting.js doesnt exist. disabled');
    } else {
        throw e;
    }
}

var nodemailer = require('nodemailer');

exports.send = function(to, subject, body) {
    if (!enabled) {
        return;
    }
    var transporter = nodemailer.createTransport(setting.transportOptions);
    var options = {
        from: setting.from,
        to: to,
        subject: subject,
        text: body
    };
    transporter.sendMail(options, function(err, res) {
        if (err) {
            console.error(err);
        } else {
            console.info('Message sent: ' + res.message);
        }
    });
}

exports.getBaseURL = function() {
    return setting.baseURL;
}
