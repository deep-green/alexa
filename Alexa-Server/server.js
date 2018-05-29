'use strict';

var AlexaAppServer = require( 'alexa-app-server' );

var server = new AlexaAppServer( {
	httpPort: 55000,
	httpsPort: 55001,
 httpsEnabled: true,
 privateKey: 'private-key.pem',
 certificate: 'cert.cer'
} );

server.start()
