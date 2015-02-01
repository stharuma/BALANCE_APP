'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LinkSchema = new Schema({
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
    /* here are cash to work read faster */
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


var Link = mongoose.model('Link', LinkSchema);

function updateLinks(contribution) {
    Link.find({
        to: contribution._id
    }, function(err, links) {
        if (err) {
            return;
        }
        links.forEach(function(link) {
            link._to = Link.createCashObj(contribution);
            link.markModified('_to');
            link.save();
        });
    });
    Link.find({
        from: contribution._id
    }, function(err, links) {
        if (err) {
            return;
        }
        links.forEach(function(link) {
            link._from = Link.createCashObj(contribution);
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

Link.createCashObj = function(contribution) {
    var cash = {};
    cash.type = contribution.type;
    cash.title = contribution.title;
    cash.authors = contribution.authors;
    cash.permission = contribution.permission;
    cash.status = contribution.status;
    return cash;
}

module.exports = Link;