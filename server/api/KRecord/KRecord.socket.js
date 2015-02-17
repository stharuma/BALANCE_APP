/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var KRecord = require('./KRecord.model');

exports.register = function(socketio) {
    KRecord.schema.post('save', function(record) {
        socketio.sockets.to(record.authorId).emit('record:save', record);
    });
}