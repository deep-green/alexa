//dialog?
//gast anmeldung?
//spielende feststellen und ausgeben

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
		var farbe = false;
		if(enemy== undefined){


			kidiff = request.slot('KIDifficulty');
			if(request.slot('Farbe')=="schwarz"){
				farbe = true;
			}
			if(kidiff=="eins"){
				enemy="ki_1";
			}
			if(kidiff=="zwei"){
				enemy="ki_2";
			}
		}
		console.log(enemy);
		return cn.newGame(enemy,farbe).then(function(msg){

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
		console.log("Zug: "+start+end);
		let session = request.getSession();
		let gameid = session.get("gameid");
		let fen = session.get("aktFen");
		console.log("aktfen: "+ fen);
		return cn.makeMove(start,end,gameid,fen).then(function(msg){
			return new Promise(function(resolve, reject){

	  	console.log(msg);
			if(msg=="invalid"){
				response.say("Der Zug war nicht gültig, versuchen sie es erneut");
				response.shouldEndSession(false);
				resolve("invalid");
			}else{
					response.say("Ihr Gegner ist jetzt am Zug.");

					let string = JSON.stringify(msg);
					let json = JSON.parse(string);
					let fens = json['FEN'];
					let sessions = request.getSession();
					sessions.set("aktFen", fens);

					let enemyMove =   function(request,response) {
						return new Promise(function(resolve, reject){

							let session = request.getSession();
							let gameid = session.get("gameid");
							let aktFen = session.get("aktFen");
							return cn.awaitMove().then(function(msg){
								let string = JSON.stringify(msg);
								let json = JSON.parse(string);
								let fen = json['FEN'];
								let zug = cn.moveBerechnen(aktFen,fen);
								session.set("gegnerZug",zug);
								session.set("aktFen", fen);
						});
					});
					}
					enemyMove(request,response).then(function(msg){

					});
					response.shouldEndSession(false);
					resolve("valid");
			}


			});
		}).then(function(msg){
			if(msg=="invalid"){
					console.log("Zug invalid");
					response.shouldEndSession(false);
			}else{
				let sessions = request.getSession();
				let zug = sessions.get("gegnerZug");
				response.say("Ihr Gegner hat den Zug"+zug+" gemacht , Sie sind drann.")
				response.shouldEndSession(false);
			}
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
		response.shouldEndSession(false);

  }
);

app.intent('forfeit',
  {
    "slots":{}
	,"utterances":[
    "aufgeben",
		"aufgabe",
		"forfeit",
		"ff",
  ]
  },
  function(request,response) {

		let session = request.getSession();
		let gameid = session.get("gameid");
		return cn.forfeit(gameid).then(function(msg){
	  	response.say("Sie haben aufgegeben.");
			response.shouldEndSession(true);
	});
}
);


app.intent('awaitMove',
  {
    "slots":{}
	,"utterances":[
    "warte",
		"warte auf den Zug meines Gegners",
  ]
  },
  function(request,response) {

		let session = request.getSession();
		let gameid = session.get("gameid");
		let aktFen = session.get("aktFen");
		return cn.awaitMove().then(function(msg){
			let string = JSON.stringify(msg);
			let json = JSON.parse(string);
			let fen = json['FEN'];
			let zug = cn.moveBerechnen(aktFen,fen);
			session.set("gegnerZug",zug);
			session.set("aktFen", fen);
			response.say("Ihr Gegner hat den Zug"+zug+" gemacht , Sie sind drann.")
			response.shouldEndSession(false);
	});
}
);


app.intent('lastTurn',
  {
    "slots":{}
	,"utterances":[
    "letzter Zug",
  ]
  },
  function(request,response) {

		let session = request.getSession();
		let zug = session.get("gegnerZug");
		let msg = "";
		if(zug==""){
			msg = "Ihr gegner hat noch keinen Zug gemacht";
		}else{
			msg = zug;
		}
		response.say(msg);
		response.shouldEndSession(false);
}
);



module.exports = app;
