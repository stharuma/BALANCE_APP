'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KObjectSchema = new Schema({
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
    title: {
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },
    status: { //unsaved, active or inactive
        type: String,
        required: false, //this should be true in the future
        index: true,
        default: 'active' //this should be unsaved in the future
    },
    permission: { //public or private
        type: String,
        required: false, //this should be true in the future
        index: true,
        default: 'public'
    },
    authors: {
        type: [Schema.ObjectId],
        default: []
    },
    data: {
        type: Schema.Types.Mixed,
        default: {}
    }
});

module.exports = mongoose.model('KObject', KObjectSchema);