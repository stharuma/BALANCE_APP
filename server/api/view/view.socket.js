/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var View = require('./view.model');

exports.register = function(socket) {
  View.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  View.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('view:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('view:remove', doc);
}