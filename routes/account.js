const Router = require('restify-router').Router;
const routerInstance = new  Router();
const Joi = require('joi');
const User = require('../models/user');
const C = require("../core/constants");
const sendVerificationMail = require('../core/mailer/nodemailer');

module.exports = function(server){
	// add all routes registered in the router to this server instance
// add a route like you would on a restify server instance
	routerInstance.post({
		path:'/register',
		validation:	{
			schema:{
				body: Joi.object().keys({
					username: Joi.string().alphanum().min(3).max(30).required(),
					fullName: Joi.string().min(3).max(40).required(),
					password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
					email: Joi.string().email({ minDomainSegments: 2, minDomainAtoms:2 }).required()
				}).required()
			}}},
		(req, res, next) => {
			let user = new User({
				fullName: req.body.fullName.trim(),
				email: req.body.email.trim(),
				username: req.body.username.trim(),
				password: req.body.password.trim(),
				roles: [C.ROLE_USER],
				provider: "local"
			});
			user.save(async function(err, user) {
				if (err && err.code === 11000){
					console.log(err);
					res.json(503, err);
					return next();
				}
				await sendVerificationMail(user);
				delete user.password;
				delete user.verifyToken;
				user.password = undefined;
				user.verifyToken = undefined;
				res.send(200, user);
				return next();
			});

	});

	routerInstance.get('/verify/:token', async (req, res, next)=>{
		try{
			let user = await User.findOne({ verifyToken: req.params.token }).exec();
			if (!user)  return res.json(404, {err:"User does not exist"});

			user.verified = true;
			user.verifyToken = undefined;
			user.lastLogin = Date.now();

			let savedUser = await user.save();
			delete savedUser.password;

			req.login(savedUser, function(err) {
				return res.json(savedUser);
			});
		}catch(e){
			throw e;
//			return res.json(e);
		}

	});

	return routerInstance.applyRoutes(server, "/api");
}
