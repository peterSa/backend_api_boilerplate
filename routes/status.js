const Router = require('restify-router').Router;
const routerInstance = new  Router();
let passport 	= require("passport");

module.exports = function(server){
	// add all routes registered in the router to this server instance
	// add a route like you would on a restify server instance
	routerInstance.get('/hello/:name', (req, res, next) => {
		if (req.isAuthenticated()){
			console.log("RESPOND AUTH")
			res.send('hello ' + req.params.name);
		}else{
			res.send("Notok");
			console.log("RESPOND NOTAUTH")
		}
		return next();
	});
	return routerInstance.applyRoutes(server, "/api");
}
