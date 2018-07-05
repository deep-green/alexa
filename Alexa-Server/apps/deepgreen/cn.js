const socket = require('socket.io-client')('http://ec2-54-93-171-91.eu-central-1.compute.amazonaws.com:4999');
const tok = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

exports.newGame = function (enemy,color) {
  return new Promise(function(resolve, reject){
    console.log("start newGame");

    let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    socket.emit('newGame', { FEN: fen, ID_enemy: enemy, color: color, token: tok },
      console.log("newGame emitted"));

    socket.once('receive', function(msg) {
      console.log("receive:");
      console.log(msg);
      resolve(msg);
    });
    socket.once('reject', function() {
      console.log("rejected");
      resolve("rejected");
    });


  });



}

exports.makeMove = function (start,end,game,fen) {
  return new Promise(function(resolve, reject){
    console.log("makeMove");
    fen = "rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1";
    //get valid moves?
    // move to fen


    socket.emit('makeMove', { FEN: fen, ID_game: game, token: tok },
      console.log("makeMove emitted"));


  socket.once('receive', function(msg) {
    console.log("receive:");
    console.log(msg);
    resolve("Ihr Gegner ist jetzt am Zug,");
  });

  socket.once('rejected', function(msg) {
    console.log("rejected:");
    console.log(msg);
    resolve("Der Zug war nicht gültig, versuchen sie es erneut");
  });
  });
}
exports.forfeit = function (game) {
  return new Promise(function(resolve, reject){
    console.log("forfeit");

    socket.emit('end', { reason: "won", ID_game: game, token: tok },
      resolve(""));
  });
}

exports.awaitMove = function () {
  return new Promise(function(resolve, reject){
    console.log("awaitMove");

    socket.once('receive', function(msg) {
      console.log("receive:");
      console.log(msg);
      resolve(msg);
    });
  });
}



}
