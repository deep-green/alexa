
exports.newGame = function () {
    console.log("hi");
    const app = require('express')();
    const http = require('http').Server(app);
    let socket = require('socket.io-client')('http://ec2-54-93-171-91.eu-central-1.compute.amazonaws.com:4999');
    socket.on('connect', function() {
        console.log("emitted");
        socket.emit('newGame', { FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ID_enemy: 'maxmustermann', color: false });
    });

    socket.on('receive', function() {
        console.log("received");
    });
    socket.on('reject', function() {
        console.log("rejected");
    });




}
