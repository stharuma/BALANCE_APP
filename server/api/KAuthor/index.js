'use strict';

var express = require('express');
var controller = require('./KAuthor.controller');

var router = express.Router();

var auth = require('../../auth/auth.service');
var commauth = require('../../auth/commauth.service');

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:communityId/me', commauth.isAuthenticated(), controller.me);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;