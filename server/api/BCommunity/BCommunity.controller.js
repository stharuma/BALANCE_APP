'use strict';

var _ = require('lodash');
var BCommunity = require('./BCommunity.model');

// Get list of BCommunitys
exports.index = function(req, res) {
  BCommunity.find(function (err, BCommunitys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(BCommunitys);
  });
};

// Get a single BCommunity
exports.show = function(req, res) {
  BCommunity.findById(req.params.id, function (err, BCommunity) {
    if(err) { return handleError(res, err); }
    if(!BCommunity) { return res.status(404).send('Not Found'); }
    return res.json(BCommunity);
  });
};

// Creates a new BCommunity in the DB.
exports.create = function(req, res) {
  BCommunity.create(req.body, function(err, BCommunity) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(BCommunity);
  });
};

// Updates an existing BCommunity in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  BCommunity.findById(req.params.id, function (err, BCommunity) {
    if (err) { return handleError(res, err); }
    if(!BCommunity) { return res.status(404).send('Not Found'); }
    var updated = _.merge(BCommunity, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(BCommunity);
    });
  });
};

// Deletes a BCommunity from the DB.
exports.destroy = function(req, res) {
  BCommunity.findById(req.params.id, function (err, BCommunity) {
    if(err) { return handleError(res, err); }
    if(!BCommunity) { return res.status(404).send('Not Found'); }
    BCommunity.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}