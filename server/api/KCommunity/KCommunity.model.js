'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KCommunitySchema = new Schema({
    title: String,
    registrationKey: {
        type: String,
        default: ''
    },
    managerRegistrationKey: {
        type: String,
        default: 'build'
    },
    created: {
        type: Date,
        default: Date.now
    },
    scaffolds: [Schema.ObjectId],
    views: [Schema.ObjectId],
});

module.exports = mongoose.model('KCommunity', KCommunitySchema);