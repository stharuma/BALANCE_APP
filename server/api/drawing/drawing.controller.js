'use strict';

var _ = require('lodash');
var Drawing = require('./drawing.model');

// Creates a new drawing in the DB.
exports.create = function(req, res) {
    req.body.type = 'Drawing';
    Drawing.create(req.body, function(err, drawing) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, drawing);
    });
};

function handleError(res, err) {
    return res.send(500, err);
}