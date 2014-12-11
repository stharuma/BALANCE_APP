'use strict';

var _ = require('lodash');
var Community = require('./community.model');

// Get list of communitys
exports.index = function(req, res) {
  Community.find(function (err, communitys) {
    if(err) { return handleError(res, err); }
    return res.json(200, communitys);
  });
};

// Get a single community
exports.show = function(req, res) {
  Community.findById(req.params.id, function (err, community) {
    if(err) { return handleError(res, err); }
    if(!community) { return res.send(404); }
    return res.json(community);
  });
};

// Creates a new community in the DB.
exports.create = function(req, res) {
  console.log(req);
  Community.create(req.body, function(err, community) {
    if(err) { return handleError(res, err); }
    return res.json(201, community);
  });
};

// Updates an existing community in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Community.findById(req.params.id, function (err, community) {
    if (err) { return handleError(res, err); }
    if(!community) { return res.send(404); }
    var updated = _.merge(community, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, community);
    });
  });
};

// Deletes a community from the DB.
exports.destroy = function(req, res) {
  Community.findById(req.params.id, function (err, community) {
    if(err) { return handleError(res, err); }
    if(!community) { return res.send(404); }
    community.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}