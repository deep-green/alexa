module.change_code = 1;
'use strict';

var alexa = require( 'alexa-app' );
var app = new alexa.app('deepgreen' );
var cn = require("./cn.js");


app.launch( function( request, response ) {
	response.say("Sie sind jetzt in ihrem Schachspiel, sie koennen jetzt ein neues Spiel starten" ).reprompt("").shouldEndSession( false );
} );


app.error = function( exception, request, response ) {
	console.log(exception)
	console.log(request);
	console.log(response);
	response.say( 'Sorry an error occured ' + error.message);
};

app.intent('newGame',
  {
		"dialog":{type: "delegate"},
    "slots":{
						"enemy":"AMAZON.DE_FIRST_NAME",
						"KIDifficulty":"AMAZON.DE_FIRST_NAME",
						"Farbe":"AMAZON.Color"}
	,"utterances":[
    "neues Spiel gegen {enemy}",
    "neues Spiel gegen {enemy} starten.",
    "neues Spiel mit {enemy} starten",
    "neues Spiel.",
    "neues Spiel starten."
  ]
  },
  function(request,response) {
		var enemy = request.slot('enemy');
		var kidiff = "";
		var farbe = true;
		if(enemy==""){
			console.log("kein enemy angegeben");
		}
			kidiff = request.slot('KIDifficulty');
			if(request.slot('Farbe')=="weiß"){
				farbe = false;
			}
			if(kidiff=="eins"){
				enemy="ki1";
			}
			if(kidiff=="zwei"){
				enemy="ki2";
			}

		console.log(enemy);
		console.log(kidiff);
		console.log(farbe);

		return cn.newGame(enemy,farbe).then(function(msg){
	  	console.log(msg);

			let string = JSON.stringify(msg);
			let json = JSON.parse(string);
			console.log(json['ID_game']);
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

			response.say("Neues Schachspiel gestartet");
			response.say('Sie spielen als die Farbe "'+color+'"');
			if(color =="weiß"){
				response.say("Sie sind am Zug. Um einen Zug zu machen formulieren sie ihn zum Beispiel so: setze a2 auf a3");
			}else{
				response.say("Ihr gegner ist am Zug. Um das Spiel fortzuführen müssen Sie den Zug des Gegners abwarten. Dies tun sie mit dem Befehl 'warte'");
			}


			response.shouldEndSession(false);

	});

  }
);

app.intent('makeMove',
  {
    "slots":{
						"startLocation":"AMAZON.DE_FIRST_NAME",
						"endLocation":"AMAZON.DE_FIRST_NAME"}
	,"utterances":[
    "setze {startLocation} auf {endLocation}",
  ]
  },
  function(request,response) {
		var start = request.slot('startLocation');
		var end = request.slot('endLocation');

		let session = request.getSession();
		let gameid = session.get("gameid");
		let fen = session.get("aktFen");
		console.log("aktfen: "+ fen);
		return cn.makeMove(start,end,gameid,fen).then(function(msg){
	  	console.log(msg);
			response.say(msg);
			response.shouldEndSession(false);
	});

  }
);

app.intent('whoseTurn',
  {
    "slots":{}
	,"utterances":[
    "Wer ist gerade drann",
		"Wer ist gerade am Zug",
  ]
  },
  function(request,response) {
		chess = require('chesslib');

		let session = request.getSession();
		let fen = session.get("aktFen");
		position = chess.FEN.parse(fen);
		let activeColor=position['activeColor']
		if(activeColor=="white"){
			activeColor="weiß";
		}
		if(activeColor=="black"){
			activeColor="schwarz";
		}
	if(activeColor == session.get("myColor")){
		response.say("Sie sind am Zug");
	}else{
		response.say("Ihr Gegner ist am Zug");
	}

  }
);


module.exports = app;
