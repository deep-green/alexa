const socket = require('socket.io-client')('http://ec2-54-93-171-91.eu-central-1.compute.amazonaws.com:4999');
const tok = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

const getPiece = function(pos,fen){
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
  return (fen[zahl][buchstabe]).toUpperCase();
}
exports.moveBerechnen = function(fenold,fennew){

  let toFen = function(fen){
    for(i = 1;i<9;i++){
      let index = (fen.indexOf(i));
      if(index > 0){
        let newStr="";
        for(x=0;x<fen[index];x++){
          newStr+="1";
        }
        fen = (fen.replace(fen[index],newStr));
        i=1;
      }
    }
    return fen;
  }

  fenold=toFen(fenold.split(" ")[0]).split("/");
  fennew=toFen(fennew.split(" ")[0]).split("/");

  let index =[];
  let values = [];

  for(zahl=0;zahl<8;zahl++){
    for(buchstabe=0;buchstabe<8;buchstabe++){
      if(fenold[zahl][buchstabe] != fennew[zahl][buchstabe]){
        index.push(String.fromCharCode(97+buchstabe)+(8-zahl));
        values.push(fennew[zahl][buchstabe]);

      }
    }

  }
  console.log(index+" "+values);
  if(values[0]==1){
    return index[0]+"-"+index[1];
  }
    return index[1]+"-"+index[0];
}

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
    console.log("Zug: "+piece+end);
    position = chess.FEN.parse(fen);
    position = position.move(piece+end);

    fen = chess.FEN.stringify(position);
    console.log("fen nach dem zug"+ fen);


    socket.emit('makeMove', { FEN: fen, ID_game: game, token: tok },
      console.log("makeMove emitted"));


  socket.once('receive', function(msg) {
    console.log("receive:");
    console.log(msg);
    resolve(msg);
  });

  socket.once('rejected', function(msg) {
    console.log("rejected:");
    console.log(msg);
    resolve("invalid");
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
