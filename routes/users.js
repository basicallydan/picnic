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
			Album.findByOwnershipCode(ownershipCode, function(err, albums) {
				albums.forEach(function(album) {
					console.log('Transfering ownership of', album.id, 'to', user.email);
					album.transferOwnership(user, ownershipCode);
					album.save();
				});
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

router.post('/authenticate', auth, function(req, res) {
	if (req.user) {
		res.status(201);
		res.send({
			user: req.user.viewModel()
		});
	} else {
		res.status(400);
		res.send({
			error: {
				message: 'You could not be logged in, sorry'
			}
		});
	}
});

module.exports = router;