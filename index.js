const chalk = require('chalk');
const statusRoutes = require("./routes/status");
const accountRoutes = require("./routes/account");
const authRoutes = require("./routes/auth");
const db = require("./core/db")();
const mongoose = require('mongoose');

mongoose.connection.on('open', (ref)=> {
	const server = require("./core/server")(null);
	server.listen(3000, function () {
		console.log(chalk.green('%s listening at %s'), server.name, server.url);
	});
	require("./core/auth/passport")(server);

	statusRoutes(server);
	accountRoutes(server);
	authRoutes(server);
})

