/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Onviewref = require('./onviewref.model');

exports.register = function(socketio) {
    Onviewref.schema.post('save', function(ref) {
        socketio.sockets.to(ref.viewId).emit('ref:save', ref);
    });
    Onviewref.schema.post('remove', function(postref) {
        socketio.sockets.to(ref.viewId).emit('ref:save', ref);
    });
}
