'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RegistrationSchema = new Schema({
    communityId: {
        type: Schema.ObjectId,
        required: true,
        index: true
    },
    authorId: {
        type: Schema.ObjectId,
        required: true,
        index: true
    },
    role: {
        type: String,
        index: true
    },
    workspaces: [Schema.ObjectId] // elements in this supposed to be viewId
    /* here are cash to work read faster */
    //community: Schema.Types.Mixed,
    //author: Schema.Types.Mixed
});

module.exports = mongoose.model('Registration', RegistrationSchema);