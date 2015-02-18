'use strict';

var express = require('express');
var controller = require('./KLink.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/from/:id', controller.fromIndex);
router.get('/to/:id', controller.toIndex);
router.get('/either/:id', controller.eitherIndex);
router.get('/view/:id', controller.viewIndex);

router.get('/updateallcache/:communityId', controller.updateAllCash);

router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;