'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KLinkSchema = new Schema({
    communityId: {
        type: Schema.ObjectId,
        required: true, //temporary
        index: true
    },
    from: {
        type: Schema.ObjectId,
        required: true,
        index: true
    },
    to: {
        type: Schema.ObjectId,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true,
        default: {}
    },
    /* here are cache in order to work faster for reading */
    _to: {
        type: Schema.Types.Mixed,
        required: true,
        default: {}
    },
    _from: {
        type: Schema.Types.Mixed,
        required: true,
        default: {}
    }
});

var KLink = mongoose.model('KLink', KLinkSchema);

function updateLinks(contribution) {
    KLink.find({
        to: contribution._id
    }, function(err, links) {
        if (err) {
            return;
        }
        links.forEach(function(link) {
            link._to = KLink.createCashObj(contribution);
            link.markModified('_to');
            link.save();
        });
    });
    KLink.find({
        from: contribution._id
    }, function(err, links) {
        if (err) {
            return;
        }
        links.forEach(function(link) {
            link._from = KLink.createCashObj(contribution);
            link.markModified('_from');
            link.save();
        });
    });
}

/* this method will be called in both update and create */
var Contribution = require('../contribution/contribution.model');
Contribution.schema.post('save', function(contribution) {
    updateLinks(contribution);
});

KLink.createCashObj = function(contribution) {
    var cache = {};
    cache.type = contribution.type;
    cache.title = contribution.title;
    cache.authors = contribution.authors;
    cache.permission = contribution.permission;
    cache.status = contribution.status;
    cache.created = contribution.created;
    cache.modified = contribution.modified;    
    return cache;
}

module.exports = KLink;