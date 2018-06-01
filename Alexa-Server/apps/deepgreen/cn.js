const socket = require('socket.io-client')('http://ec2-54-93-171-91.eu-central-1.compute.amazonaws.com:4999/deep-green');

exports.newGame = function () {

    socket.emit('newGame', { FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ID_enemy: 'maxmustermann', color: false, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" },
                console.log("newGame emitted"));

    socket.on('receive', function() {
        console.log("received");
    });
    socket.on('reject', function() {
        console.log("rejected");
    });
}
