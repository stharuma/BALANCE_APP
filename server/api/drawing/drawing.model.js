'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DrawingSchema = new Schema({
  svg: String
});

var Contribution = require('../contribution/contribution.model');
module.exports = Contribution.discriminator('Drawing', DrawingSchema);