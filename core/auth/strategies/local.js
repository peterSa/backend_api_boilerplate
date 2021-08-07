"use strict";

let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
let User = require("../../../models/user");

const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

module.exports = function() {
	passport.use(new LocalStrategy({
		usernameField: "email",
		passwordField: "password",
		passReqToCallback : true
	}, function(req, username, password, done) {
		let query = User.findOne({
			$or: [
				{ "username": username},
				{ "email": username}
			]
		})
			.select('password')
			.select('verified')
			.select('status')
			.select('passwordLess')
			.select('fullName');

		return query.exec(function(err, user) {
			if (err)
				return done(err);

			if (!user)
				return done(null, false, {
					message: "UnknowUsernameOrEmail"
				});

			if (!user.verified)
				return done(null, false, {
					message: "PleaseActivateAccount"
				});

			// Check that the user is not disabled or deleted
			if (user.status !== 1)
				return done(null, false, {
					message: "UserDisabledOrDeleted"
				});

			if (user.passwordLess)
				return done(null, false, {
					message: "PasswordlessAccountLeaveEmpty"
				});

			user.comparePassword(password, async function (err, isMatch) {
				if (err)
					return done(err);

				if (isMatch !== true) {
					return done(null, false, {
						message: "InvalidPassword"
					});
				} else {
					let userObjToReturn = await User.findOne({_id: user._id});
					return done(null, userObjToReturn);
				}

			});
		});
	}));

	passport.use(new JWTStrategy({
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
			secretOrKey   : 'your_jwt_secret'
		},
		function (jwtPayload, cb) {

			//find the user in db if needed
			console.log("payload", jwtPayload)
			return User.findOne({_id:jwtPayload._id})
				.then(user => {
					return cb(null, user);
				})
				.catch(err => {
					return cb(err);
				});
		}
	));};
