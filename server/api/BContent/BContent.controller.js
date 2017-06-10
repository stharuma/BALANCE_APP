'use strict';

var _ = require('lodash');
var BContent = require('./BContent.model');

// Get list of BContents
exports.index = function(req, res) {
  BContent.find(function (err, BContents) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(BContents);
  });
};

// Get a single BContent
exports.show = function(req, res) {
  BContent.findById(req.params.id, function (err, BContent) {
    if(err) { return handleError(res, err); }
    if(!BContent) { return res.status(404).send('Not Found'); }
    return res.json(BContent);
  });
};

// Creates a new BContent in the DB.
exports.create = function(req, res) {
  BContent.create(req.body, function(err, BContent) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(BContent);
  });
};

// Updates an existing BContent in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  BContent.findById(req.params.id, function (err, BContent) {
    if (err) { return handleError(res, err); }
    if(!BContent) { return res.status(404).send('Not Found'); }
    var updated = _.merge(BContent, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(BContent);
    });
  });
};

// Deletes a BContent from the DB.
exports.destroy = function(req, res) {
  BContent.findById(req.params.id, function (err, BContent) {
    if(err) { return handleError(res, err); }
    if(!BContent) { return res.status(404).send('Not Found'); }
    BContent.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}