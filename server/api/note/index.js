'use strict';

var express = require('express');
var controller = require('./note.controller');

var router = express.Router();
var auth = require('../../auth/auth.service');

router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;