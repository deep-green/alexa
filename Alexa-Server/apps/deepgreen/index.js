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
		"dialog":{type: "ElicitSlot"},
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
		console.log(enemy.confirmationStatus);
		console.log(enemy.resolutions(0));
		console.log(enemy.resolutions(0).status);



		var kidiff = "";
		var farbe = true;


		if(enemy == "bot"){
			//dialog =  request.getDialog();
			kidiff = request.slot('KIDifficulty');
			if(request.slot('Farbe')=="weiß"){
				farbe = false;
			}
		}else{
			request.slot('KIDifficulty')="eins";
			request.slot('Farbe')="weiß";
		}
		console.log(enemy);
		console.log(kidiff);
		console.log(farbe);

		return cn.newGame(enemy,farbe).then(function(msg){
	  	console.log(msg);

	});

  }
);


module.exports = app;
