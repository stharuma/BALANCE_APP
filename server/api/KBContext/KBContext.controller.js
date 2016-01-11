'use strict';

var _ = require('lodash');
var KBContext = require('./KBContext.model');

// Get list of KBContexts
exports.index = function(req, res) {
  KBContext.find(function (err, KBContexts) {
    if(err) { return handleError(res, err); }
    return res.json(200, KBContexts);
  });
};

// Get a single KBContext
exports.show = function(req, res) {
  KBContext.findById(req.params.id, function (err, KBContext) {
    if(err) { return handleError(res, err); }
    if(!KBContext) { return res.send(404); }
    return res.json(KBContext);
  });
};

// Creates a new KBContext in the DB.
exports.create = function(req, res) {
  KBContext.create(req.body, function(err, KBContext) {
    if(err) { return handleError(res, err); }
    return res.json(201, KBContext);
  });
};

// Updates an existing KBContext in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  KBContext.findById(req.params.id, function (err, KBContext) {
    if (err) { return handleError(res, err); }
    if(!KBContext) { return res.send(404); }
    var updated = _.merge(KBContext, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, KBContext);
    });
  });
};

// Deletes a KBContext from the DB.
exports.destroy = function(req, res) {
  KBContext.findById(req.params.id, function (err, KBContext) {
    if(err) { return handleError(res, err); }
    if(!KBContext) { return res.send(404); }
    KBContext.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}