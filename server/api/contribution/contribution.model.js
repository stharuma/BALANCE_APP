'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContributionSchema = new Schema({
    title: String,
    communityId: {
        type: Schema.ObjectId,
        required: true,
        index: true        
    },
    type: {
        type: String,
        required: true,
        index: true
    },
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

// for text index search
ContributionSchema.index({
    text4search: 'text'
});

module.exports = mongoose.model('Contribution', ContributionSchema);