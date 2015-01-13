'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommunitySchema = new Schema({
    title: String,
    registrationKey: String,
    created: {
        type: Date,
        default: Date.now
    },
    scaffolds: [Schema.ObjectId],
    views: [Schema.ObjectId],
});

module.exports = mongoose.model('Community', CommunitySchema);