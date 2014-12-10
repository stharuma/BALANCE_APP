/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Link = require('./link.model');

exports.register = function(socket) {
  Link.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Link.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('link:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('link:remove', doc);
}