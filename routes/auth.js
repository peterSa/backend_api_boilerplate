const Router = require('restify-router').Router;
const routerInstance = new  Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');


module.exports = function(server){
	// add all routes registered in the router to this server instance
// add a route like you would on a restify server instance
	routerInstance.post("/local", async function(req, res, next){

		if (req.body.email && req.body.password){
			passport.authenticate("local", async (err, user, info) => {
				if (err){
					return res.json(500, {msg: "Wrong email or password"});

				}
				if (!user){
					return res.json(503, {msg: "Wrong email or password"});
				}
				req.login(user, {session: false}, (err) => {
					if (err) {
						return res.json(503, {msg: err});
					}
					// generate a signed son web token with the contents of user object and return it in the response
					const token = jwt.sign(user.toObject(), 'your_jwt_secret');
					return res.json({user, token});
				});

			})(req,res,next);
		}else{
			return res.json(503, {msg:"Email or password missing"})
		}

	});

	return routerInstance.applyRoutes(server, "/api/login");
}
