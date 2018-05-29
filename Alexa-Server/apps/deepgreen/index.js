module.change_code = 1;
'use strict';

var alexa = require( 'alexa-app' );
var app = new alexa.app( 'deepgreen' );


app.launch( function( request, response ) {
	response.say( 'Welcome to your test skill' ).reprompt( 'Way to go. You got it to run. Bad ass.' ).shouldEndSession( false );
} );


app.error = function( exception, request, response ) {
	console.log(exception)
	console.log(request);
	console.log(response);
	response.say( 'Sorry an error occured ' + error.message);
};

app.intent('newGame',
  {
    "slots":{"enemy":"AMAZON.DE_FIRST_NAME"}
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
    response.say("Dein Gegner ist "+enemy);
  }
);

module.exports = app;