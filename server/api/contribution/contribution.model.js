'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContributionSchema = new Schema({
    title: String,
    authors: {
        type: [Schema.ObjectId],
        default: []
    },
    permission: { //public or private
        type: String,
        required: false, //this should be true in the future
        index: true,
        default: 'public'
    },
    keywords: [String],
    text4search: String
});

// for text index search
ContributionSchema.index({
    text4search: 'text'
});

var KObject = require('../KObject/KObject.model');
module.exports = KObject.discriminator('KContribution', ContributionSchema);