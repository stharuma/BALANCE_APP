'use strict';

var _ = require('lodash');
var BObject = require('./BObject.model');

// Get list of BObjects
exports.index = function(req, res) {
  BObject.find(function (err, BObjects) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(BObjects);
  });
};

// Get a single BObject
exports.show = function(req, res) {
  BObject.findById(req.params.id, function (err, BObject) {
    if(err) { return handleError(res, err); }
    if(!BObject) { return res.status(404).send('Not Found'); }
    return res.json(BObject);
  });
};

// Creates a new BObject in the DB.
exports.create = function(req, res) {
  BObject.create(req.body, function(err, BObject) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(BObject);
  });
};

// Updates an existing BObject in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  BObject.findById(req.params.id, function (err, BObject) {
    if (err) { return handleError(res, err); }
    if(!BObject) { return res.status(404).send('Not Found'); }
    var updated = _.merge(BObject, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(BObject);
    });
  });
};

// Deletes a BObject from the DB.
exports.destroy = function(req, res) {
  BObject.findById(req.params.id, function (err, BObject) {
    if(err) { return handleError(res, err); }
    if(!BObject) { return res.status(404).send('Not Found'); }
    BObject.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}