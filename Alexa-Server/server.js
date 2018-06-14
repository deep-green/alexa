'use strict';

var AlexaAppServer = require( 'alexa-app-server' );

var server = new AlexaAppServer( {
	httpsEnabled: true,
	port: 6500,
	log: true,
	httpsPort: 6501,
	verify:true,
	debug: false,
	privateKey: 'private-key.pem',
	
	certificate: 'certificate.pem'

} );

server.start()
