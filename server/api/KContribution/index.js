'use strict';

var express = require('express');
var controller = require('./KContribution.controller');
var commauth = require('../../auth/commauth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/:communityId', commauth.isAuthenticated(), controller.create);
router.post('/:communityId/search', controller.search);
//router.delete('/:id', controller.destroy);

module.exports = router;