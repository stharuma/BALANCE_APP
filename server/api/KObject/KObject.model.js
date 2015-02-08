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
    data: Schema.Types.Mixed
});

module.exports = mongoose.model('KObject', KObjectSchema);