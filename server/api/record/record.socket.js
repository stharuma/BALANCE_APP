/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Record = require('./record.model');

exports.register = function(socketio) {
    Record.schema.post('save', function(record) {
        socketio.sockets.to(record.authorId).emit('record:save', record);
    });
}
