'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LinkSchema = new Schema({
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
    data: Schema.Types.Mixed,
    /* here are cash to work read faster */
    typeTo: String,
    titleTo: String,
    authorsTo: [Schema.ObjectId],
    typeFrom: String,
    titleFrom: String,
    authorsFrom: [Schema.ObjectId]
});


var Link = mongoose.model('Link', LinkSchema);
var updateLinks = function(contribution) {
    Link.find({
        to: contribution._id
    }, function(err, links) {
        if (err) {
            return;
        }
        links.forEach(function(link) {
            link.typeTo = contribution.type;
            link.titleTo = contribution.title;
            link.markModified('authorsTo');
            link.authorsTo = contribution.authors;
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
            link.typeFrom = contribution.type;
            link.titleFrom = contribution.title;
            link.markModified('authorsFrom');
            link.authorsFrom = contribution.authors;
            link.save();
        });
    });
};

/* this method will be called in both update and create */
var Contribution = require('../contribution/contribution.model');
Contribution.schema.post('save', function(contribution) {
    updateLinks(contribution);
});

/* thism method should call when create a link */
Link.createCash = function(link, handler) {
    if (!link.typeTo || !link.typeFrom) {
        Contribution.findById(link.from, function(err, fromObj) {
            if (err || fromObj === null) {
                console.log(err);
                return;
            }
            Contribution.findById(link.to, function(err, toObj) {
                if (err || toObj === null) {
                    console.log(err);
                    return;
                }
                link.typeFrom = fromObj.type;
                link.titleFrom = fromObj.title;
                link.authorsFrom = fromObj.authors;
                link.typeTo = toObj.type;
                link.titleTo = toObj.title;
                link.authorsTo = toObj.authors;
                handler(link);
            });
        });
    } else {
        handler(link);
    }
};

module.exports = Link;