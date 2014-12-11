'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AttachmentSchema = new Schema({
    url: String,
    mime: String,
    originalName: String,
    size: Number
});

var Contribution = require('../contribution/contribution.model');
module.exports = Contribution.discriminator('Attachment', AttachmentSchema);