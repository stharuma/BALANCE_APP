'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BContentSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('BContent', BContentSchema);