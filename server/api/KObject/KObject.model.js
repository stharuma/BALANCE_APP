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
    group: {
        type: Schema.ObjectId,
        index: true
    },
    _groupMembers: { //cache for group members for reading optimization
        type: [Schema.ObjectId],
        default: []
    },
    data: {
        type: Schema.Types.Mixed,
        default: {}
    }
});

var KObject = mongoose.model('KObject', KObjectSchema);

KObjectSchema.post('save', function(obj) {
    if (obj.group && !obj._groupMembers) {
        KObject.findById(obj.group, function(err, group) {
            if (err || !group) {
                console.error('error on updating groupmembers.');
            }
            KObject.findOneAndUpdate({
                _id: obj._id
            }, {
                _groupMembers: group.members
            }, function(err) {
                if (err) {
                    console.error(err);
                }
            });
        });
    }
    if (obj.type === 'Group') {
        KObject.update({
            group: obj._id
        }, {
            $set: {
                _groupMembers: obj.members
            }
        }, function(err) {
            if (err) {
                console.error(err);
            }
        });
    }
});

module.exports = KObject;