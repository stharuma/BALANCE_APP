/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var BContent = require('./BContent.model');

exports.register = function(socket) {
  BContent.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  BContent.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('BContent:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('BContent:remove', doc);
}