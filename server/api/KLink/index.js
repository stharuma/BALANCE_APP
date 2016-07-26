'use strict';

var express = require('express');
var controller = require('./KLink.controller');
var commauth = require('../../auth/commauth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/from/:id', controller.fromIndex);
router.get('/to/:id', controller.toIndex);
router.get('/either/:id', controller.eitherIndex);
router.get('/view/:id', controller.viewIndex);
router.get('/buildson/:id', controller.buildsonIndex); // ajout michelle janvier 2016

router.get('/updateallcache/:communityId', controller.updateAllCash);

router.get('/:id', controller.show);
router.post('/', commauth.isLinkAuthenticated(), controller.create);
router.put('/:id', commauth.isLinkAuthenticated(), controller.update);
router.delete('/:id', commauth.isLinkAuthenticatedById(), controller.destroy);

module.exports = router;