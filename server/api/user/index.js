'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/myRegistrations', auth.isAuthenticated(), controller.myRegistrations);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/search/count', auth.hasRole('admin'), controller.searchCount);
router.post('/search', auth.hasRole('admin'), controller.search);
router.post('/', controller.create);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id', auth.hasRole('admin'), controller.forceUpdate);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;