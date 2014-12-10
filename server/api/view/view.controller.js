'use strict';

var _ = require('lodash');
var View = require('./view.model');

// Get list of views
exports.index = function(req, res) {
  View.find(function (err, views) {
    if(err) { return handleError(res, err); }
    return res.json(200, views);
  });
};

// Get a single view
exports.show = function(req, res) {
  View.findById(req.params.id, function (err, view) {
    if(err) { return handleError(res, err); }
    if(!view) { return res.send(404); }
    return res.json(view);
  });
};

// Creates a new view in the DB.
exports.create = function(req, res) {
  req.body.type = 'View';
  View.create(req.body, function(err, view) {
    if(err) { return handleError(res, err); }
    return res.json(201, view);
  });
};

// Updates an existing view in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  View.findById(req.params.id, function (err, view) {
    if (err) { return handleError(res, err); }
    if(!view) { return res.send(404); }
    var updated = _.merge(view, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, view);
    });
  });
};

// Deletes a view from the DB.
exports.destroy = function(req, res) {
  View.findById(req.params.id, function (err, view) {
    if(err) { return handleError(res, err); }
    if(!view) { return res.send(404); }
    view.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}