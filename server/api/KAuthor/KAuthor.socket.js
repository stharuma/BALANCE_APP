/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var KAuthor = require('./KAuthor.model');

exports.register = function(socket) {
  KAuthor.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  KAuthor.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('KAuthor:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('KAuthor:remove', doc);
}