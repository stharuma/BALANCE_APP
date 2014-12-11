'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RecordSchema = new Schema({
    communityId: {
        type: Schema.ObjectId,
        required: false, /*temporary false*/
        index: true
    },
    authorId: {
        type: Schema.ObjectId,
        required: true,
        index: true
    },
    targetId: {
        type: Schema.ObjectId,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Record', RecordSchema);