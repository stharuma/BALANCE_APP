'use strict';

var express = require('express');
var router = express.Router();

var pkg = require('../../package.json');
var version = pkg.version;
var versions = pkg.version.split('.');
var major = versions[0] + '.' + versions[1];
var minor = versions[2];
var build = pkg.build;

router.get('/version', function(req, res) {
    return res.json({
        version: version,
        major: major,
        minor: minor,        
        build: build
    });
});

module.exports = router;