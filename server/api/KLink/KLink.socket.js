/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var KLink = require('./KLink.model');

exports.register = function(socketio) {
    KLink.schema.post('save', function(link) {
        socketio.sockets.to(link.from).emit('ref:save', link);
    });
    KLink.schema.post('remove', function(ref) {
        socketio.sockets.to(link.from).emit('ref:remove', link);
    });
}