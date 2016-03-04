'use strict';

var express = require('express');
var controller = require('./notification.controller');

var router = express.Router();

router.get('/notify/:contextId', controller.notify);

module.exports = router;
