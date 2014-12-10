/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Link = require('./link.model');

exports.register = function(socketio) {
    Link.schema.post('save', function(ref) {
        socketio.sockets.to(ref.from).emit('ref:save', ref);
    });
    Link.schema.post('remove', function(ref) {
        socketio.sockets.to(ref.from).emit('ref:remove', ref);
    });
}