'use strict';

var express = require('express');
var controller = require('./community.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:id/views', auth.isAuthenticated(), controller.showviews);
router.get('/:id/authors', auth.isAuthenticated(), controller.showauthors);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;