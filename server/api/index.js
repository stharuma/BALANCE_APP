'use strict';

var express = require('express');
var router = express.Router();

var pkg = require('../../package.json');
var version = pkg.version;
var versions = pkg.version.split('.');
var major = versions[0];
var minor = versions[1];
var patch = versions[2];
var build = pkg.build;

router.get('/version', function(req, res) {
  return res.json({
    version: version,
    major: major,
    minor: minor,
    patch: patch,
    build: build
  });
});

module.exports = router;
