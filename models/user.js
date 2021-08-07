var mongoose = require('mongoose');
let C = require("../core/constants");
let bcrypt = require("bcrypt");
let crypto = require("crypto");
let config = require('../config.json');
let chalk = require('chalk');

let schemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
};

let validateLocalStrategyProperty = function(property) {
	return (this.provider !== "local" && !this.updated) || property.length;
};

let validateLocalStrategyPassword = function(password) {
	return this.provider !== "local" || (password && password.length >= 6);
};

let UserSchema = new mongoose.Schema({
	fullName: {
		type: String,
		trim: true,
		default: "",
		validate: [validateLocalStrategyProperty, "Please fill in your full name"]
	},
	email: {
		type: String,
		trim: true,
		unique: true,
		index: true,
		lowercase: true,
		default: "",
		validate: [validateLocalStrategyProperty, "Please fill in your email"],
		match: [/.+\@.+\..+/, "Please fill a valid email address"]
	},
	// username: {
	// 	type: String,
	// 	unique: true,
	// 	index: true,
	// 	lowercase: true,
	// 	required: "Please fill in a username",
	// 	trim: true,
	// 	match: [/^[\w][\w\-\._\@]*[\w]$/, "Please fill a valid username"]
	// },
	password: {
		type: String,
		default: "",
		validate: [validateLocalStrategyPassword, "Password should be longer"],
		select: false
	},
	passwordLess: {
		type: Boolean,
		default: false
	},
	passwordLessToken: {
		type: String
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		default: "local"
	},
	profile: {
		name: { type: String },
		gender: { type: String },
		picture: { type: String },
		location: { type: String }
	},
	socialLinks: {
		facebook: { type: String, unique: true, sparse: true },
		twitter: { type: String, unique: true, sparse: true },
		google: { type: String, unique: true, sparse: true },
		github: { type: String, unique: true, sparse: true }
	},
	roles: {
		type: [
			{
				type: String,
				"enum": [
					C.ROLE_ADMIN,
					C.ROLE_USER,
					C.ROLE_GUEST
				]
			}
		],
		"default": [C.ROLE_USER]
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	verified: {
		type: Boolean,
		default: undefined
	},
	verifyToken: {
		type: String
	},
	apiKey: {
		type: String,
		unique: true,
		index: true,
		sparse: true
	},
	lastLogin: {
		type: Date
	},
	locale: {
		type: String
	},
	status: {
		type: Number,
		default: 1
	},
	metadata: {}

}, schemaOptions);

async function generateToken() {
	const buffer = await new Promise((resolve, reject) => {
		crypto.randomBytes(256, function(ex, buffer) {
			if (ex) {
				reject("error generating token");
			}
			resolve(buffer);
		});
	});
	const token = crypto
		.createHash("sha1")
		.update(buffer)
		.digest("hex");

	return token;
}

/**
 * Password hashing
 */
UserSchema.pre("save", async function(next) {
	let user = this;
	if(user.verified === undefined || user.verified === null){
		if (config.mailer.enabled) {
			// user email verification is only enabled if mailer is enabled
			user.verified = false;
			user.verifyToken = await generateToken();
		} else {
			user.verified = true;
		}
	}

	if (!user.isModified("password"))
		return next();


	// bcrypt.genSalt(10, function(err, salt) {
	// 	user.salt = salt;
		user.password = await bcrypt.hash(user.password, 10);
		next()
	// });
});

/**
 * Password compare
 */
UserSchema.methods.comparePassword = function(password, cb) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		console.log(err, "isMatch", isMatch)
		cb(err, isMatch);
	});
};

/**
 * Virtual field for `avatar`.
 */
UserSchema.virtual("avatar").get(function() {
	// Load picture from profile
	if (this.profile && this.profile.picture)
		return this.profile.picture;

	// Generate a gravatar picture
	if (!this.email)
		return "https://gravatar.com/avatar/?s=64&d=wavatar";

	let md5 = crypto.createHash("md5").update(this.email).digest("hex");
	return "https://gravatar.com/avatar/" + md5 + "?s=64&d=wavatar";
});

let User = mongoose.model("User", UserSchema);

module.exports = User;
