'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KAuthorSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: false
    },
    userId: {
        type: Schema.ObjectId,
        index: true
    },
    role: {
        type: String,
        index: true
    },
    workspaces: [Schema.ObjectId], // elements in this supposed to be viewId

    /* here are cache to work read faster */
    _community: {
        type: Schema.Types.Mixed,
        default: {
            title: 'Uncached',
            created: Date.now
        }
    },
    _user: Schema.Types.Mixed
});

var KObject = require('../KObject/KObject.model');
module.exports = KObject.discriminator('KAuthor', KAuthorSchema);