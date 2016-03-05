'use strict';

var express = require('express');
var controller = require('./notification.controller');

var router = express.Router();

router.post('/notify/:communityId', controller.notify);

module.exports = router;
