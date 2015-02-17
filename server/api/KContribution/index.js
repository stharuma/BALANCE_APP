'use strict';

var express = require('express');
var controller = require('./KContribution.controller');
var auth = require('../../auth/auth.service');
var commauth = require('../../auth/commauth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/:communityId', commauth.isAuthenticated(), controller.create);
router.put('/:communityId/:id', commauth.isAuthenticated(), controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.post('/search', controller.search);

module.exports = router;