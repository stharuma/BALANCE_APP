'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OnviewrefSchema = new Schema({
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    showInPlace: Boolean,
    fixed: Boolean
});

var Link = require('../link/link.model');
module.exports = Link.discriminator('Onviewref', OnviewrefSchema);