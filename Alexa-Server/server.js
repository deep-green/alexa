'use strict';

var AlexaAppServer = require( 'alexa-app-server' );

var server = new AlexaAppServer( {
	server_root: __dirname,
	httpsEnabled: true,
	port: 6500,
	log: true,
	httpsPort: 6501,
	verify:false,
	debug: true,
	privateKey: 'private-key.pem',
	certificate: 'certificate.pem',
	preRequest: function(json, req, res) {
    console.log("preRequest fired");
    json.userDetails = { "name": "Bob Smith" };
  },
  // Add a dummy attribute to the response
  postRequest: function(json, req, res) {
    console.log("JKO");
    json.dummy = "text";
  }

} );

server.start()
