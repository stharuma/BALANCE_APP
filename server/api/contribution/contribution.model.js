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
    permission: {//public or private
        type: String,
        //required: true,//temporary not required
        index: true,
        default: 'public'
    },
    keywords:[String],
    text4search: String,
    data: Schema.Types.Mixed
});

// for text index search
ContributionSchema.index({
    text4search: 'text'
});

module.exports = mongoose.model('Contribution', ContributionSchema);