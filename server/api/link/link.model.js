'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LinkSchema = new Schema({
    from: Schema.ObjectId,
    to: Schema.ObjectId,
    type: {
        type: String,
        index: true
    },
    title: String,
    authors: [Schema.ObjectId]
});

module.exports = mongoose.model('Link', LinkSchema);