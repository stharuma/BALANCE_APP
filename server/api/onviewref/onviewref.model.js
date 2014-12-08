'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OnviewrefSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Onviewref', OnviewrefSchema);