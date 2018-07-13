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
const moveBerechnen = function(fenold,fennew){

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

exports.newGame = function (enemy,color,response, request) {
  return new Promise(function(resolve, reject){
    console.log("start newGame");

    let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    socket.emit('newGame', { FEN: fen, ID_enemy: enemy, color: color, token: tok },
      console.log("newGame emitted"));

    socket.once('receive', function(msg) {
      console.log("receive:");
      console.log(msg);

      let string = JSON.stringify(msg);
			let json = JSON.parse(string);
			let gameid = json['ID_game'];
			let fen = json['FEN'];
			let color = json['color'];
			if (color == false){
				color = "weiß";
			}else{
				color = "schwarz";
			}

      let session = request.getSession();
			session.set("gameid", gameid);
			session.set("aktFen", fen);
			session.set("myColor",color);
			session.set("gegnerZug","");

			response.say("Neues Schachspiel gestartet");
			response.say('Sie spielen als die Farbe "'+color+'".');
			if(color =="weiß"){
				response.say("Sie sind am Zug. Um einen Zug zu machen formulieren sie ihn zum Beispiel so: setze a2 auf a3");
        response.shouldEndSession(false);
        resolve("weiß");
      }else{
				response.say("Ihr gegner ist am Zug. Sie warten jetzt auf den Zug ihres Gegners.");
        let gameid = session.get("gameid");
        let aktFen = session.get("aktFen");
        exports.awaitMove().then(function(msg){
          let string = JSON.stringify(msg);
          let json = JSON.parse(string);
          let fen = json['FEN'];
          let zug = moveBerechnen(aktFen,fen);
          session.set("gegnerZug",zug);
          session.set("aktFen", fen);
          response.say("Ihr Gegner hat den Zug "+zug+" gemacht , Sie sind drann.");
          response.shouldEndSession(false);
          resolve("Gegner hat gespielt.");
        });
			}


      resolve(msg);
    });
    socket.once('reject', function() {
      console.log("rejected");
      resolve("rejected");
    });


  });



}

exports.makeMove = function (start,end,game,fen,response,request) {
  return new Promise(function(resolve, reject){
    console.log("makeMove");

    let piece = getPiece(start,fen);
    chess = require('chesslib');
    console.log("Zug: "+piece+end);
    position = chess.FEN.parse(fen);
    if(piece=="1"){
      resolve("invalid");
    }
    if(piece =="P"){
      position = position.move(end);
    }else{
      position = position.move(piece+end);
    }


    fen = chess.FEN.stringify(position);
    console.log("fen nach dem zug"+ fen);

    fen = fen.substr(0,fen.length-2) + " 0 "+ fen[fen.length-1];

    socket.emit('makeMove', { "FEN": fen, "ID_game": game, "token": tok },
      console.log("makeMove emitted"));


  socket.once('receive', function(msg) {
    console.log("receive:");
    console.log(msg);
    response.say("Es wird jetzt darauf gewartet, dass ihr Gegner einen Zug macht.\n");

    let session = request.getSession();
    let gameid = session.get("gameid");
    let aktFen = session.get("aktFen");
    exports.awaitMove().then(function(msg){
      let string = JSON.stringify(msg);
      let json = JSON.parse(string);
      let fen = json['FEN'];
      let zug = moveBerechnen(aktFen,fen);
      session.set("gegnerZug",zug);
      session.set("aktFen", fen);
      response.say("Ihr Gegner hat den Zug "+zug+" gemacht , Sie sind drann.");
      resolve("Gegner hat gespielt.");
    });


  });

  socket.once('rejected', function(msg) {
    console.log("rejected:");
    console.log(msg)
    response.say("Der Zug war nicht gültig. Versuchen sie es erneut.");
    resolve("invalid");
  });
});


};

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
