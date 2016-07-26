'use strict';

var _ = require('lodash');
var KHistoricalObject = require('./KHistoricalObject.model');

// Get a single KHistoricalObject
exports.show = function(req, res) {
    KHistoricalObject.findById(req.params.id, function(err, KHistoricalObject) {
        if (err) {
            return handleError(res, err);
        }
        if (!KHistoricalObject) {
            return res.send(404);
        }
        return res.json(KHistoricalObject);
    });
};

function handleError(res, err) {
    return res.send(500, err);
}