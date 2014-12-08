/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Onviewref = require('./onviewref.model');

exports.register = function(socket) {
  Onviewref.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Onviewref.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('onviewref:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('onviewref:remove', doc);
}