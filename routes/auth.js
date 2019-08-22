const Router = require('restify-router').Router;
const routerInstance = new  Router();
let passport 	= require("passport");


module.exports = function(server){
	// add all routes registered in the router to this server instance
// add a route like you would on a restify server instance

	routerInstance.post("/local", async function(req, res, next){
		if (req.body.email && req.body.password){
			passport.authenticate("local", async (err, user, info) => {
				if (!user || err){
					return res.json(503, {msg: err});

				}
					req.user.lastLogin = Date.now();
					req.user = await req.user.save();
					req.user.password = undefined;
					req.user.salt = undefined;
					return res.json(req.user);
			})(req,res,next);
		}else{
			return req.json(503, {msg:"Email or password missing"})
		}

	});

	return routerInstance.applyRoutes(server, "/api");
}
