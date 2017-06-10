'use strict';

var _ = require('lodash');
var BAuthor = require('./BAuthor.model');

// Get list of BAuthors
exports.index = function(req, res) {
  BAuthor.find(function (err, BAuthors) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(BAuthors);
  });
};

// Get a single BAuthor
exports.show = function(req, res) {
  BAuthor.findById(req.params.id, function (err, BAuthor) {
    if(err) { return handleError(res, err); }
    if(!BAuthor) { return res.status(404).send('Not Found'); }
    return res.json(BAuthor);
  });
};

// Creates a new BAuthor in the DB.
exports.create = function(req, res) {
  BAuthor.create(req.body, function(err, BAuthor) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(BAuthor);
  });
};

// Updates an existing BAuthor in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  BAuthor.findById(req.params.id, function (err, BAuthor) {
    if (err) { return handleError(res, err); }
    if(!BAuthor) { return res.status(404).send('Not Found'); }
    var updated = _.merge(BAuthor, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(BAuthor);
    });
  });
};

// Deletes a BAuthor from the DB.
exports.destroy = function(req, res) {
  BAuthor.findById(req.params.id, function (err, BAuthor) {
    if(err) { return handleError(res, err); }
    if(!BAuthor) { return res.status(404).send('Not Found'); }
    BAuthor.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}