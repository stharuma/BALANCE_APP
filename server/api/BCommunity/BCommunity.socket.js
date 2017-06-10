/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var BCommunity = require('./BCommunity.model');

exports.register = function(socket) {
  BCommunity.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  BCommunity.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('BCommunity:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('BCommunity:remove', doc);
}