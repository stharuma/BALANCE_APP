'use strict';

var express = require('express');
var controller = require('./commauth.controller');
var router = express.Router();
var auth = require('../auth/auth.service');

router.post('/login', auth.isAuthenticated(), controller.login);

module.exports = router;