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
    }
    /* here are cash to work read faster */
    //community: Schema.Types.Mixed,
    //author: Schema.Types.Mixed
});

module.exports = mongoose.model('Registration', RegistrationSchema);