'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContributionSchema = new Schema({
    title: String,
    type: {
        type: String,
        index: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    authors: {
        type: [Schema.ObjectId],
        default: []
    },
    text4search: String
});

ContributionSchema.index({
    text4search: 'text'
});

var Contribution = mongoose.model('Contribution', ContributionSchema);

var Link = require('../link/link.model');
Contribution.updateLinks = function(contribution) {
    Link.find({
        to: contribution._id
    }, function(err, links) {
        if (err) {
            return;
        }
        links.forEach(function(link) {
            link.title = contribution.title;
            link.markModified('authors');
            link.authors = contribution.authors;
            link.save();
        });
    });
};

/* this method will be called in both update and create */
Contribution.schema.post('save', function(contribution) {
    Contribution.updateLinks(contribution);
});



module.exports = Contribution;