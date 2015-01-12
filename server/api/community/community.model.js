'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommunitySchema = new Schema({
    title: String,
    registrationKey: String,
    scaffolds: [Schema.ObjectId],
    views: [Schema.ObjectId],        
    authors: [Schema.ObjectId],    
});

module.exports = mongoose.model('Community', CommunitySchema);