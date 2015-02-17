'use strict';

var express = require('express');
var controller = require('./KRecord.controller');

var router = express.Router();
var auth = require('../../auth/auth.service');

router.post('/read/:contributionId', auth.isAuthenticated(), controller.read);
router.get('/count/:viewId/:authorId', auth.isAuthenticated(), controller.count);

router.get('/', controller.index);
router.get('/contribution/:contributionId', auth.isAuthenticated(), controller.indexOfContribution);
router.get('/:id', controller.show);

module.exports = router;
