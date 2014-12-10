'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LinkSchema = new Schema({
    from: {
        type: Schema.ObjectId,
        index: true
    },
    to: {
        type: Schema.ObjectId,
        index: true
    },
    type: {
        type: String,
        index: true
    },
    /* here are cash to work read faster */
    title: String,
    authors: [Schema.ObjectId]
});

module.exports = mongoose.model('Link', LinkSchema);