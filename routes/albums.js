var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require('../middleware/auth');
var passport = require('passport');
var Album = require('../models/Album');
var User = require('../models/User');
var _ = require('underscore');

/* POST albums listing. */
router.post('/', auth({ required : false }), multer({
	dest: './uploads/'
}), function(req, res, next) {
	var album; // This will be a new album
	var files = [];
	var newAlbumOptions = {};

	if (req.user) {
		newAlbumOptions.owner = req.user;
	} else if (req.cookies.ownershipCode) {
		newAlbumOptions.ownershipCode = req.cookies.ownershipCode;
	}

	if (!(req.files instanceof Array)) {
		newAlbumOptions.files = _.map(req.files, function(file) {
			return file;
		});
	} else {
		newAlbumOptions.files = req.files;
	}
	album = new Album(newAlbumOptions);
	album.save(function(err, album) {
		res.cookie('ownershipCode', album.ownershipCode);
		res.send({ album : album.viewModel() });
	});
});

router.get('/', auth({ required : false }), function(req, res, next) {
	var ownershipCode = req.query.ownershipCode || req.cookies.ownershipCode;
	var user = req.user;
	if (!user && ownershipCode) {
		console.log('Looking for albums with ownershipCode', ownershipCode);
		Album.findByOwnershipCode(ownershipCode, function(err, albums) {
			var albumViewModels = _.map(albums, function(album) {
				return album.viewModel();
			});
			res.send({ albums : albumViewModels });
		});
	} else {
		console.log('Looking for albums with ownershipCode', ownershipCode);
		Album.findByOwner(user, function(err, albums) {
			console.log('Found', albums.length, 'albums owned by user', user.username);
			var albumViewModels = _.map(albums, function(album) {
				return album.viewModel();
			});
			res.send({ albums : albumViewModels });
		});
	}
});

router.patch('/:shortName', function(req, res, next) {
	var album;
	var user;
	var ownershipCode = req.query.ownershipCode || req.cookies.ownershipCode;
	var email;

	console.log('Body:', req.body);

	if (req.body.owner && _.isString(req.body.owner.email)) {
		email = req.body.owner.email;
		album = Album.findByShortName(req.params.shortName, function(err, album) {
			console.log('Album:', album, 'ownership code:', ownershipCode);
			if (!album.authorizeOwnershipCode(ownershipCode)) {
				res.status(401);
				return res.send({
					message: 'You are not authorized to transfer ownership of this album'
				});
			}
			user = User.findByEmail(email, function(err, user) {
				if (!user) {
					user = new User({
						email: email
					});
					user.save(function(err, user) {
						album.transferOwnership(user);
						album.save(function(err, user) {
							res.send({ album : album.viewModel() });
						});
					});
				}
			});
		});
	}
});

module.exports = router;