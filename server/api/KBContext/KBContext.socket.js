/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var KBContext = require('./KBContext.model');

exports.register = function(socket) {
  KBContext.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  KBContext.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('KBContext:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('KBContext:remove', doc);
}