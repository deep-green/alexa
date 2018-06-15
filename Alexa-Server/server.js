'use strict';

var AlexaAppServer = require( 'alexa-app-server' );

var server = new AlexaAppServer( {
	server_root: __dirname,
	httpsEnabled: true,
	port: 6500,
	log: true,
	httpsPort: 443,
	verify:true,
	debug: false,
	privateKey: 'private-key.pem',
	certificate: 'certificate.pem',

} );

server.start()
