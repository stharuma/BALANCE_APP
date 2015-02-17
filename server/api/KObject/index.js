'use strict';

var express = require('express');
var controller = require('./KObject.controller');
var commauth = require('../../auth/commauth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', commauth.isAuthenticated(), controller.show);
router.post('/:communityId', commauth.isAuthenticated(), controller.create);
router.put('/:communityId/:id', commauth.isAuthenticated(), controller.update);
router.delete('/:communityId/:id', commauth.isAuthenticated(), controller.destroy);

module.exports = router;