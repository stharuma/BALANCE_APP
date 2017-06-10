'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BAuthorSchema = new Schema({
  userId: {
        type: Schema.ObjectId,
        required: true,
        index: true
    },
    userName: { /* user.userName field will be copied to this field */
        type: String,
        required: true,
        index: true
    },
    email: { /* user.email field will be copied if available */
        type: String,
        required: false,
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
    blockLogin: { /* temporary for blocking login*/
        type: Boolean,
        required: false,
        index: true
    }

    /* here are cache to work read faster */
    // _community: {
    //     type: Schema.Types.Mixed,
    //     default: {
    //         title: 'Uncached',
    //         created: Date.now
    //     }
    // }
});

var BObject = require('../BObject/BObject.model');
var BAuthor = BObject.discriminator('BAuthor', BAuthorSchema);

BAuthor.createAuthor = function(role, user, success, failure) {//removed community
    var seed = {};
   // seed.communityId = community._id;
    seed.userId = user._id;
    seed.type = 'Author';
    seed.role = role;
    seed.permission = 'protected';
    seed.userName = user.userName;
    seed.email = user.email;
    seed.firstName = user.firstName;
    seed.lastName = user.lastName;
    // seed._community = {
    //     title: community.title,
    //     created: community.created
    // };
    BAuthor.create(seed, function(err, author) {
        if (err) {
            if (failure) {
                failure(err);
            }
            return;
        }
        if (success) {
            success(author);
        }
        return;
    });
};

module.exports = BAuthor;