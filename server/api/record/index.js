'use strict';

var express = require('express');
var controller = require('./record.controller');

var router = express.Router();
var auth = require('../../auth/auth.service');

router.post('/read/:contributionId', auth.isAuthenticated(), controller.read);
router.get('/count/:viewId/:authorId', auth.isAuthenticated(), controller.count);

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;