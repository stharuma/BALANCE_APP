'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommunitySchema = new Schema({
    title: String,
    registrationKey: String
});

module.exports = mongoose.model('Community', CommunitySchema);