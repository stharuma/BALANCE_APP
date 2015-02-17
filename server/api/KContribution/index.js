'use strict';

var express = require('express');
var controller = require('./KContribution.controller');
var commauth = require('../../auth/commauth.service');

var router = express.Router();

router.post('/:communityId', commauth.isAuthenticated(), controller.create);
router.post('/:communityId/search', commauth.isAuthenticated(), controller.search);

module.exports = router;