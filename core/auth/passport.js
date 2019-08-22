"use strict";

let config 			= require("../../config");

let passport 		= require("passport");
let path 			= require("path");
let chalk 			= require("chalk");

let User = require("../../models/user");

module.exports = function(app) {

	// Use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user, done) {
		return done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		console.log("search")
		User.findById({
			_id: id
		}, "-password", function(err, user) {
			console.log("search2")
			if (err)
				return done(err);

			// Check that the user is not disabled or deleted
			if (!user || user.status !== 1)
				return done(null, false);

			return done(null, user);
		});
	});

	console.info(chalk.bold("Search passport strategies..."));
	require('./strategies/local')();
};
