/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var KLink = require('./KLink.model');

exports.register = function(socketio) {
    KLink.schema.post('save', function(link) {
        socketio.sockets.to('linkfrom:' + link.from).emit('link:save', link);
    });
    KLink.schema.post('remove', function(link) {
        socketio.sockets.to('linkfrom:' + link.from).emit('link:remove', link);
    });
}