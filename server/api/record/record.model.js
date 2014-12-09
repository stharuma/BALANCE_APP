'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RecordSchema = new Schema({
    authorId: Schema.ObjectId,
    targetId: Schema.ObjectId,
    type: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Record', RecordSchema);