'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OnviewrefSchema = new Schema({
    viewId: Schema.ObjectId,
    postId: Schema.ObjectId,
    x: Number,
    y: Number,
    title: String,
    authors: [Schema.ObjectId],
});

module.exports = mongoose.model('Onviewref', OnviewrefSchema);