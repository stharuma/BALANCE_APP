'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NoteSchema = new Schema({
    body: String
});

var Contribution = require('../contribution/contribution.model');
module.exports = Contribution.discriminator('Note', NoteSchema);