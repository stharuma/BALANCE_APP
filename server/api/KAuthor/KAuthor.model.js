'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KAuthorSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        required: true,
        index: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
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
    }
});

var KObject = require('../KObject/KObject.model');
module.exports = KObject.discriminator('KAuthor', KAuthorSchema);