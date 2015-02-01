'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LinkSchema = new Schema({
    communityId: {
        type: Schema.ObjectId,
        required: false, //temporary
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
    /*
    typeTo: String,
    titleTo: String,
    authorsTo: [Schema.ObjectId],
    typeFrom: String,
    titleFrom: String,
    authorsFrom: [Schema.ObjectId]
    */
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
            link._to = createCash(contribution);
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
            link._from = createCash(contribution);
            link.markModified('_from');
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
Link.createWithCash = function(seed, handler) {
    Link.create(seed, function(err, link) {
        if (err) {
            return handler(err);
        }
        Link.updateCash(link, handler);
    });
};

/* thism method should call when create a link */
Link.updateCash = function(link, handler) {
    if (!link || !link.from || !link.to) {
        console.log('error link = ' + JSON.stringify(link));
        return handler();
    }
    Contribution.findById(link.from, function(err, from) {
        if (err) {
            if (handler) {
                handler(err);
            }
            return;
        }
        Contribution.findById(link.to, function(err, to) {
            if (err) {
                if (handler) {
                    handler(err);
                }
                return;
            }
            if (from === null || to === null) {
                showMissingLinkMsg(link, from, to);
                link._from = 'missing';
                link._to = 'missing';
                return link.save(handler);
            }
            link._from = createCash(from);
            link.markModified('_from');
            link._to = createCash(to);
            link.markModified('_to');
            return link.save(handler);
        });
    });
};

function createCash(seed) {
    var cash = {};
    cash.type = seed.type;
    cash.title = seed.title;
    cash.authors = seed.authors;
    return cash;
}

function showMissingLinkMsg(link, fromObj, toObj) {
    var msg = 'missinglink';
    msg += ', type=' + link.type;
    msg += ', from=' + link.from;
    if (fromObj) {
        msg += ', fromType=' + fromObj.type;
    }
    msg += ', to=' + link.to;
    if (toObj) {
        msg += ', toType=' + toObj.type;
    }
    console.log(msg);
}

module.exports = Link;