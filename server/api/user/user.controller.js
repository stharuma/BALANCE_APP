'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var KAuthor = require('../KAuthor/KAuthor.model');

var validationError = function(res, err) {
    console.error(err);
    return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
    res.status(200).json([]);
    // User.find({}, '-salt -hashedPassword', function (err, users) {
    //   if(err) return res.send(500, err);
    //   res.json(200, users);
    // });
};

function makeQuery(req) {
    var queryStr = req.body.query ? req.body.query : '';
    var regexpstr = '(?=.*' + queryStr + ').*';
    var regexp = new RegExp(regexpstr, 'i');
    return {
        email: regexp
    };
}

exports.searchCount = function(req, res) {
    var query = makeQuery(req);
    User.count(query, function(err, count) {
        if (err) {
            return handleError(res, err);
        }
        console.log(count);
        return res.status(200).json({
            count: count
        });
    });
};

exports.search = function(req, res) {
    var query = makeQuery(req);
    var pagesize = req.body.pagesize ? req.body.pagesize : 10;
    var page = req.body.page ? req.body.page : 1;
    var skip = pagesize * (page - 1);
    User.find(query).skip(skip).
    limit(pagesize).exec(function(err, users) {
        if (err) {
            return handleError(res, err);
        }
        return res.status(200).json(users);
    });
};

exports.myRegistrations = function(req, res) {
    KAuthor.find({
        userId: req.user._id
    }, function(err, authors) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(authors);
    });
};

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {

    //Here is a temporary registration password system.
    if (!req.body.registrationKey) {
        return res.status(422).json({
            errorCode: 'invalidRegistrationKey'
        });
    }
    if (req.body.registrationKey !== 'kcreation') {
        return res.status(422).json({
            errorCode: 'invalidRegistrationKey'
        });
    }

    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    newUser.save(function(err, user) {
        if (err) {
            return validationError(res, err);
        }
        var token = jwt.sign({
            _id: user._id
        }, config.secrets.session, {
            expiresInMinutes: 60 * 5
        });
        res.json({
            token: token
        });
    });
};

/**
 * Get a single user
 */
exports.show = function(req, res, next) {
    var userId = req.params.id;

    User.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);
        res.json(user.profile);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.send(500, err);
        return res.send(204);
    });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    User.findById(userId, function(err, user) {
        if (user.authenticate(oldPass)) {
            user.password = newPass;
            user.save(function(err) {
                if (err) {
                    return validationError(res, err);
                }
                res.send(200);
            });
        } else {
            res.send(403);
        }
    });
};


exports.forceUpdate = function(req, res, next) {
    var userId = req.params.id;
    User.findById(userId, function(err, user) {
        if (err) {
            return validationError(res, err);
        }
        if (!user) {
            return res.send(403);
        }
        user.password = req.body.password;
        user.save(function(err) {
            if (err) {
                return validationError(res, err);
            }
            res.send(200);
        });
    });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401);
        res.json(user);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

function handleError(res, err) {
    return res.send(500, err);
}