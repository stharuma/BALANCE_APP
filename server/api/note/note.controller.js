'use strict';

var _ = require('lodash');
var Note = require('./note.model');
var Link = require('../link/link.model');
var Onviewref = require('../onviewref/onviewref.model');
var Record = require('../record/record.model');

// Get list of notes
exports.index = function(req, res) {
    Note.find(function(err, notes) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, notes);
    });
};

// Get a single note
exports.show = function(req, res) {
    Note.findById(req.params.id, function(err, note) {
        if (err) {
            return handleError(res, err);
        }
        if (!note) {
            return res.send(404);
        }
        return res.json(note);
    });
};

var createBuildsOn = function(req, res, note, buildsonId) {
    Link.create({
        from: note._id,
        to: buildsonId,
        type: 'buildson'
    }, function(err, link) {
        if (err) {
            return handleError(res, err);
        }
        Onviewref.find({
                to: link.to,
            },
            function(err, refs) {
                if (err) {
                    return handleError(res, err);
                }
                refs.forEach(function(ref) {
                    Onviewref.create({
                        from: ref.from,
                        to: link.from,
                        type: 'onviewref',
                        x: ref.x + 50,
                        y: ref.y + 50
                    }, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
                return res.json(201, note);
            });
    });
};

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
            return createBuildsOn(req, res, note, req.body.buildson);
        }
        return res.json(201, note);
    });
};

// Updates an existing note in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Note.findById(req.params.id, function(err, note) {
        if (err) {
            return handleError(res, err);
        }
        if (!note) {
            return res.send(404);
        }
        var updated = _.merge(note, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, note);
        });
    });
};

// Deletes a note from the DB.
exports.destroy = function(req, res) {
    Note.findById(req.params.id, function(err, note) {
        if (err) {
            return handleError(res, err);
        }
        if (!note) {
            return res.send(404);
        }
        note.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    console.log(err);
    return res.send(500, err);
}