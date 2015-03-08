var express = require('express');
var User = require('../models/User');
var Album = require('../models/Album');
var router = express.Router();
var auth = require('../middleware/auth');
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
	console.log('Signing up user', req.body);
	var ownershipCode;

	if (req.cookies.ownershipCode) {
		ownershipCode = req.cookies.ownershipCode;
	}

	User.register(new User({
		email: req.body.email,
		username: req.body.email
	}), req.body.password, function(err, user) {
		if (err) {
			res.status(400);
			return res.send({
				error: err,
				user: user
			});
		}

		if (ownershipCode) {
			user.takeOwnershipOfAlbums(ownershipCode, function(err) {
				passport.authenticate('local')(req, res, function() {
					res.status(201);
					res.send(user.viewModel({
						numberOfAlbums: albums.length
					}));
				});
			});
		} else {
			console.log('No ownership code specified for', user.email);
			passport.authenticate('local')(req, res, function() {
				res.status(201);
				res.send(user);
			});
		}
	});
});

router.post('/authenticate', function(req, res, next) {
	console.log('Signing in user', req.body.username, 'with password length', req.body.password.length);
	var ownershipCode;

	if (req.cookies.ownershipCode) {
		ownershipCode = req.cookies.ownershipCode;
	}

	passport.authenticate('local', function(err, user, info) {
		if (err) {
			console.log('Error authenticating user', err);
			return next(err);
		}

		if (!user) {
			console.log('User could not be signed in.');
			res.status(401);
			return res.send({
				message: 'Authentication failed'
			});
		}

		if (user) {
			console.log('Signed in user', user.username);
			if (ownershipCode) {
				console.log('Transferring albums to', user.username, 'with ownership code', ownershipCode);
				req.user.takeOwnershipOfAlbums(ownershipCode, function(err) {
					req.logIn(user, function(err) {
						if (err) {
							return next(err);
						}
						res.status(201);
						res.send({
							user: user.viewModel()
						});
					});
				});
			} else {
				req.logIn(user, function(err) {
					if (err) {
						return next(err);
					}
					res.status(201);
					res.send({
						user: user.viewModel()
					});
				});
			}
		}
	})(req, res, next);
});

module.exports = router;