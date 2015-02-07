'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommunitySessionSchema = new Schema({
    token: {
        type: String,
        index: {
            unique: true
        }
    },
    author: Schema.Types.Mixed
});

module.exports = mongoose.model('community_session', CommunitySessionSchema);