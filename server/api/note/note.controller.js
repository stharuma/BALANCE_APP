'use strict';

var _ = require('lodash');
var Note = require('./note.model');
var Link = require('../link/link.model');
var Record = require('../record/record.model');

// Creates a new note in the DB.
exports.create = function(req, res) {
    req.body.type = 'Note';
    Note.create(req.body, function(err, note) {
        if (err) {
            return handleError(res, err);
        }
        Record.create({
            authorId: req.user._id,
            targetId: note._id,
            type: 'create'
        });
        if (req.body.buildson !== null) {
            return exports.createBuildsOn(req, res, note, req.body.buildson);
        }
        return res.json(201, note);
    });
};

// this method is painful
exports.createBuildsOn = function(req, res, note, buildsonId) {
    Link.createCash({
        from: note._id,
        to: buildsonId,
        type: 'buildson'
    }, function(obj) {
        Link.create(obj, function(err, link) {
            if (err) {
                return handleError(res, err);
            }
            Link.find({
                    to: link.to,
                    type: 'onviewref'
                },
                function(err, refs) {
                    if (err) {
                        return handleError(res, err);
                    }
                    refs.forEach(function(ref) {
                        var newref = {
                            from: ref.from,
                            to: link.from,
                            type: 'onviewref',
                            data: {
                                x: ref.data.x + 50,
                                y: ref.data.y + 50
                            }
                        };
                        Link.createCash(newref, function(newref) {
                            Link.create(newref, function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    });
                    return res.json(201, note);
                });
        });
    });
};

function handleError(res, err) {
    console.log(err);
    return res.send(500, err);
}