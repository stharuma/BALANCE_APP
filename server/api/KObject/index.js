'use strict';

var express = require('express');
var controller = require('./KObject.controller');
var commauth = require('../../auth/commauth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', commauth.checkPermissionById('r'), controller.show);
router.post('/:communityId', commauth.isAuthenticated(), controller.create);
router.put('/:communityId/:id', commauth.checkPermissionById('w'), controller.update);
router.delete('/:communityId/:id', commauth.checkPermissionById('w'), controller.destroy);

module.exports = router;
