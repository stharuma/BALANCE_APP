'use strict';

var express = require('express');
var controller = require('./registration.controller');
var auth = require('../../auth/auth.service');
var commauth = require('../../commauth/commauth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/me', commauth.isAuthenticated(), controller.me);
router.get('/:id', controller.show);
router.get('/:communityId/:authorId', controller.showByCommunityUser);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;