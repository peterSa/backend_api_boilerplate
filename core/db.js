// getting-started.js
var mongoose = require('mongoose');
module.exports = function(config){
	mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});
	// If the Node process ends, close the Mongoose connection
	process.on('SIGINT', () => {
		mongoose.connection.close(() => {
			process.exit(0);
		});
	});
	return mongoose.connection;
}
