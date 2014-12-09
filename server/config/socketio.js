/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');

// When the user disconnects.. perform this
function onDisconnect(socket) {}

// When the user connects.. perform this
function onConnect(socket) {
    // When the client emits 'info', this listens and executes
    socket.on('info', function(data) {
        console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
    });

    // Insert sockets below
    require('../api/record/record.socket').register(socket);
    require('../api/onviewref/onviewref.socket').register(socket);
    require('../api/note/note.socket').register(socket);
    require('../api/view/view.socket').register(socket);
    require('../api/contribution/contribution.socket').register(socket);
    require('../api/thing/thing.socket').register(socket);
}

module.exports = function(socketio) {
    socketio.on('connection', function(socket) {
        socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

        socket.connectedAt = new Date();

        socket.on('disconnect', function() {
            console.info('[%s] DISCONNECTED', socket.address);
        });
        socket.on('subscribe', function(room) {
            console.info('[%s] subscribes %s', socket.address, room);
            socket.join(room);
        });
        socket.on('unsubscribe', function(room) {
            console.info('[%s] unsubscribes %s', socket.address, room);
            socket.leave(room);
        });
        console.info('[%s] CONNECTED', socket.address);
    });

    require('../api/onviewref/onviewref.socket').register(socketio);
    require('../api/record/record.socket').register(socketio);
};