'use strict';

var express = require('express');
var controller = require('./contribution.controller');

var router = express.Router();
var auth = require('../../auth/auth.service');

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.post('/search', controller.search);
router.get('/records/:id', controller.showrecords);

var multipart = require('connect-multiparty');
var config = require('../../config/environment');
var multipartMiddleware = multipart({ uploadDir: config.attachmentsPath });
router.post('/upload', multipartMiddleware, controller.upload);

module.exports = router;