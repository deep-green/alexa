'use strict';

var AlexaAppServer = require( 'alexa-app-server' );

var server = new AlexaAppServer( {
	httpsEnabled: false,
	httpPort: 6500
	/*httpsPort: 55001,
 httpsEnabled: true,
 privateKey: 'private-key.pem',
 certificate: 'cert.cer'
 */
} );

server.start()
