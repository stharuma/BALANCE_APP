/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var BObject = require('./BObject.model');

exports.register = function(socket) {
  BObject.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  BObject.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('BObject:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('BObject:remove', doc);
}