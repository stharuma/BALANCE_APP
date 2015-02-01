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

/* for attachments */
var fs = require('fs');
var config = require('../../config/environment');
if (fs.existsSync(config.attachmentsPath) === false) {
    var res = fs.mkdirSync(config.attachmentsPath);
}
var app = require('../../app');
//auth does not work because img will be retrieved the browser auth, not angular $http auth
//app.use('/uploads', auth.isAuthenticated(), express.static(config.attachmentsPath));
app.use(config.attachmentsURL, express.static(config.attachmentsPath));

/* for attachments upload */
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({
    uploadDir: config.attachmentsPath
});
router.post('/upload', multipartMiddleware, controller.upload);

module.exports = router;