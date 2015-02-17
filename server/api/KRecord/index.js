'use strict';

var express = require('express');
var controller = require('./KRecord.controller');

var router = express.Router();
var commauth = require('../../auth/commauth.service');

router.get('/:id', controller.show);
/*router.get('/object/:objectId', commauth.isAuthenticated(), controller.indexOfContribution);*/
router.get('/object/:objectId', controller.index);
router.get('/count/:communityId/:viewId', commauth.isAuthenticated(), controller.count);
router.post('/read/:communityId/:contributionId', commauth.isAuthenticated(), controller.read);

module.exports = router;
