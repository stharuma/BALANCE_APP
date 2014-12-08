'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NoteSchema = new Schema({
    title: String,
    created: {
        type: Date,
        default: Date.now
    },
    authors: {
        type: [Schema.ObjectId],
        default: []
    },
    text4search: String
});

module.exports = mongoose.model('Note', NoteSchema);