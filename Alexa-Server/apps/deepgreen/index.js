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
		return cn.newGame(enemy,farbe,response,request).then(function(msg){
			console.log("return: "+msg);
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
		"{startLocation} auf {endLocation}",
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
		return cn.makeMove(start,end,gameid,fen,response,request).then(function(msg){
	  	console.log(msg);
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
			msg = "Der letzte Zug ihres Gegners war: "+zug;
		}
		response.say(msg);
		response.shouldEndSession(false);
}
);



module.exports = app;
