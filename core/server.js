let restify = require('restify');
const chalk = require('chalk');
const validator = require('restify-joi-middleware');
var sessions = require('client-sessions');

module.exports = function(db){

	console.log(chalk.yellow("Starting restify server"));
	var server = restify.createServer({
		certificate: null,     // If you want to create an HTTPS server, pass in the PEM-encoded certificate and key
		key: null,             // If you want to create an HTTPS server, pass in the PEM-encoded certificate and key
		formatters: null,      //  Custom response formatters for res.send()
		log: null,             // You can optionally pass in a bunyan instance; not required
		name: 'node-api',      // By default, this will be set in the Server response header, default is restify
		spdy: null,            // Any options accepted by node-spdy
		version: '1.0.0',      // A default version to set for all routes
		handleUpgrades: false  // Hook the upgrade event from the node HTTP server, pushing Connection: Upgrade requests through the regular request handling chain; defaults to false
	});

	server.on('NotFound', function (request, response, cb) {});              // When a client request is sent for a URL that does not exist, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 404 handler. It is expected that if you listen for this event, you respond to the client.
	server.on('MethodNotAllowed', function (request, response, cb) {});      // When a client request is sent for a URL that does exist, but you have not registered a route for that HTTP verb, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 405 handler. It is expected that if you listen for this event, you respond to the client.
	server.on('VersionNotAllowed', function (request, response, cb) {});     // When a client request is sent for a route that exists, but does not match the version(s) on those routes, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 400 handler. It is expected that if you listen for this event, you respond to the client.
	server.on('UnsupportedMediaType', function (request, response, cb) {});  // When a client request is sent for a route that exist, but has a content-type mismatch, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 415 handler. It is expected that if you listen for this event, you respond to the client.
	server.on('after', function (request, response, route, error) {});       // Emitted after a route has finished all the handlers you registered. You can use this to write audit logs, etc. The route parameter will be the Route object that ran.
	server.on('uncaughtException', function (request, response, route, error) {});  // Emitted when some handler throws an uncaughtException somewhere in the chain. The default behavior is to just call res.send(error), and let the built-ins in restify handle transforming, but you can override to whatever you want here.



	// server
	// 	.use(sessions({
	// 		cookieName: 'user',
	// 		secret: 'topsecret',
	// 		duration: 365 * 24 * 60 * 60 * 1000}))
	server.use(restify.plugins.acceptParser(server.acceptable))
	server.use(restify.plugins.queryParser())
	server.use(restify.plugins.bodyParser())
	server.use(restify.plugins.gzipResponse())
	server.use(restify.plugins.fullResponse());         // sets up all of the default headers for the system
	server.use(validator()) // see "Middleware Options" for all options
	server.use(
		function crossOrigin(req,res,next){
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "X-Requested-With");
			return next();
		}
	);

	function corsHandler(req, res, next) {

		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
		res.setHeader('Access-Control-Allow-Methods', '*');
		res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
		res.setHeader('Access-Control-Max-Age', '1000');

		return next();
	}
	function optionsRoute(req, res, next) {

		res.send(200);
		return next();
	}

	server.opts('/\.*/', corsHandler, optionsRoute);


	return server;
}
