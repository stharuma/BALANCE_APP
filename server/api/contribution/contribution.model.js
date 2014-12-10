'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContributionSchema = new Schema({
    title: String,
    type: {
        type: String,
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

ContributionSchema.index({
    text4search: 'text'
});

module.exports = mongoose.model('Contribution', ContributionSchema);