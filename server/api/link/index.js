'use strict';

var express = require('express');
var controller = require('./link.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/from/:id', controller.fromindex);
router.get('/to/:id', controller.toindex);
router.get('/tofrom/:id', controller.tofromindex);
router.get('/onview/:id', controller.onviewindex);
router.get('/updateallcache/:communityId', controller.updateAllCash);

router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;