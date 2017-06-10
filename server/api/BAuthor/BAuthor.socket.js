/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var BAuthor = require('./BAuthor.model');

exports.register = function(socket) {
  BAuthor.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  BAuthor.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('BAuthor:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('BAuthor:remove', doc);
}