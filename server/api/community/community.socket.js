/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Community = require('./community.model');

exports.register = function(socket) {
  Community.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Community.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('community:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('community:remove', doc);
}