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

    let piece = getPiece(start,fen);
    chess = require('chesslib');

    position = chess.FEN.parse(fen);
    position = position.move(piece+end);
    fen = chess.FEN.stringify(position);
    console.log("fen nach dem zug": fen);


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

let getPiece = function(pos,fen){
  let onlyfen = fen.split(" ")[0];

  for(i = 1;i<9;i++){
    let index = (onlyfen.indexOf(i));
    if(index > 0){
      let newStr="";
      for(x=0;x<onlyfen[index];x++){
        newStr+="1";
      }
      onlyfen = (onlyfen.replace(onlyfen[index],newStr));
      i=1;
    }

  }
  fen = onlyfen.split("/");
  let zahl = 8-pos.split("")[1];
  let buchstabe = pos.split("")[0];
  switch(buchstabe){
    case "a":
      buchstabe=0;
      break;
    case "b":
    buchstabe=1;
      break;
    case "c":
    buchstabe=2;
        break;
    case "d":
    buchstabe=3;
        break;
    case "e":
    buchstabe=4;
          break;
    case "f":
    buchstabe=5;
          break;
    case "g":
    buchstabe=6;
            break;
    case "h":
    buchstabe=7;
            break;

  }
  return (fen[zahl][buchstabe]);
}
