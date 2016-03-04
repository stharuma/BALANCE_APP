'use strict';

try {
    var setting = require('./setting.js');
    var enabled = true;
} catch (e) {
    var enabled = false;
    if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        console.log('The file kfmail/setting.js doesnt exist. disabled');
    } else {
        throw e;
    }
}

var nodemailer = require('nodemailer');

exports.send = function(to, subject, body) {
    if (!enabled) {
        return;
    }
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
