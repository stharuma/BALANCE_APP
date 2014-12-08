'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ViewSchema = new Schema({
  title: String
});

module.exports = mongoose.model('View', ViewSchema);