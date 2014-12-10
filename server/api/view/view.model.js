'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ViewSchema = new Schema({
  title: String
});

var Contribution = require('../contribution/contribution.model');
module.exports = Contribution.discriminator('View', ViewSchema);
