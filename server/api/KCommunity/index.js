'use strict';

var express = require('express');
var controller = require('./KCommunity.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:id/views', auth.isAuthenticated(), controller.showviews);
router.get('/:id/authors', auth.isAuthenticated(), controller.showauthors);
router.get('/:id/groups', auth.isAuthenticated(), controller.showgroups);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;

