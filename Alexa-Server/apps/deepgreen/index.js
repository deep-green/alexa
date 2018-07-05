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


			dialog =  request.getDialog();
			kidiff = request.slot('KIDifficulty');
			if(request.slot('Farbe')=="weiß"){
				farbe = false;
			}
			if(kidiff=="eins"){
				enemy="ki1";
			}

		console.log(enemy);
		console.log(kidiff);
		console.log(farbe);

		return cn.newGame("peter",farbe).then(function(msg){
	  	console.log(msg);

			var json = JSON.parse(msg);
			console.log(json['ID_game']);
			let gameid = json['ID_game'];
			let fen = json['FEN'];

			let session = request.getSession();
			session.set("gameid", gameid);
			session.set("aktFen", fen);

			response.say("Neues Schachspiel gestartet");
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

	});

  }
);


module.exports = app;
