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
    status: { //unsaved, active or inactive
        type: String,
        required: false,//this should be true in the future
        index: true,
        default: 'unsaved'
    },
    permission: { //public or private
        type: String,
        required: false,//this should be true in the future
        index: true,
        default: 'public'
    },
    keywords: [String],
    text4search: String,
    data: Schema.Types.Mixed
});

// for text index search
ContributionSchema.index({
    text4search: 'text'
});

module.exports = mongoose.model('Contribution', ContributionSchema);