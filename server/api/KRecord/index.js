'use strict';

var express = require('express');
var controller = require('./KRecord.controller');

var router = express.Router();
var auth = require('../../auth/auth.service');
var commauth = require('../../auth/commauth.service');

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/contribution/:contributionId', auth.isAuthenticated(), controller.indexOfContribution);
router.get('/count/:communityId/:viewId', commauth.isAuthenticated(), controller.count);

router.post('/read/:communityId/:contributionId', commauth.isAuthenticated(), controller.read);

module.exports = router;
