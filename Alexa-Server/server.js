'use strict';

var AlexaAppServer = require( 'alexa-app-server' );

var server = new AlexaAppServer( {
	httpsEnabled: true,
	port: 6500,
	httpsPort: 6501,
	privateKey: 'private-key.pem',
	certificate: 'cert.cer'

} );

server.start()
