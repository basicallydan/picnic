var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require('../middleware/auth');
var passport = require('passport');
var Album = require('../models/Album');
var User = require('../models/User');
var _ = require('underscore');
var cloudinary = require('cloudinary');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');

cloudinary.config({
	cloud_name: 'dys2lsskw',
	api_key: '976447557551824',
	api_secret: 'vUHsdVarc_Wkye9nw9iPiQzF9cg'
});

/* POST albums listing. */
// router.post('/', auth({ required : false }), multer({
// 	dest: './uploads/'
// }), function(req, res, next) {
// 	var album; // This will be a new album
// 	var files = [];
// 	var newAlbumOptions = {};

// 	if (req.user) {
// 		newAlbumOptions.owner = req.user;
// 	} else if (req.cookies.ownershipCode) {
// 		newAlbumOptions.ownershipCode = req.cookies.ownershipCode;
// 	}

// 	if (!(req.files instanceof Array)) {
// 		newAlbumOptions.files = _.map(req.files, function(file) {
// 			return file;
// 		});
// 	} else {
// 		newAlbumOptions.files = req.files;
// 	}
// 	album = new Album(newAlbumOptions);
// 	album.save(function(err, album) {
// 		res.cookie('ownershipCode', album.ownershipCode);
// 		res.send({ album : album.viewModel() });
// 	});
// });

/* POST albums listing. */
router.post('/', auth({
	required: false
}), function(req, res, next) {
		var form = new multiparty.Form();
		var cloudStream = cloudinary.uploader.upload_stream(function() {
			res.status(200);
			res.send({
				message: 'OK'
			});
		});

		form.on('part', function(part) {
			// You *must* act on the part by reading it
			// NOTE: if you want to ignore it, just call "part.resume()"

			if (part.filename === null) {
				// filename is "null" when this is a field and not a file
				console.log('got field named ' + part.name);
				// ignore field's content
				part.resume();
			}

			if (part.filename !== null) {
				console.log(util.inspect(part));
				cloudStream.write(part);
				// filename is not "null" when this is a file
				count++;
				console.log('got file named ' + part.name);
				// ignore file's content here
				part.resume();
			}

			part.on('error', function(err) {
				console.error(err);
			});
		});

		// Close emitted after form parsed
		form.on('close', function() {
			cloudStream.end();
		});

		form.parse(req);
	});

router.get('/', auth({
	required: false
}), function(req, res, next) {
		var ownershipCode = req.query.ownershipCode || req.cookies.ownershipCode;
		var user = req.user;
		if (!user && ownershipCode) {
			console.log('Looking for albums with ownershipCode', ownershipCode);
			Album.findByOwnershipCode(ownershipCode, function(err, albums) {
				var albumViewModels = _.map(albums, function(album) {
					return album.viewModel();
				});
				res.send({
					albums: albumViewModels,
					links: {
						web: '/a'
					}
				});
			});
		} else {
			console.log('Looking for albums with ownershipCode', ownershipCode);
			Album.findByOwner(user, function(err, albums) {
				console.log('Found', albums.length, 'albums owned by user', user.username);
				var albumViewModels = _.map(albums, function(album) {
					return album.viewModel();
				});
				res.send({
					albums: albumViewModels,
					links: {
						web: '/a'
					}
				});
			});
		}
	});

router.patch('/:shortName', function(req, res, next) {
	var album;
	var user;
	var ownershipCode = req.query.ownershipCode || req.cookies.ownershipCode;
	var email;

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
							res.send({
								album: album.viewModel()
							});
						});
					});
				}
			});
		});
	}
});

router.get('/:shortName', auth({
	required: false
}), function(req, res, next) {
		Album.findByShortName(req.params.shortName, function(err, album) {
			var responseObject = {
				title: 'Album',
				user: req.user
			};
			if (album) {
				res.send({
					album: album.viewModel()
				});
			} else {
				res.status(404);
				res.send({
					message: 'Album with shortname' + req.params.shortname + ' could not be found'
				});
			}
		});
	});

router.post('/:shortName/files', auth({
	required: false
}), multer({
		dest: './uploads/'
	}), function(req, res, next) {
		Album.findByShortName(req.params.shortName, function(err, album) {
			if (!album) {
				res.status(404);
				return res.send({
					message: 'Album with shortname' + req.params.shortname + ' could not be found'
				});
			}

			var files;

			if (!(req.files instanceof Array)) {
				files = _.map(req.files, function(file) {
					return file;
				});
			}

			console.log('Adding', files.length, 'files to the album');

			files.forEach(function(file) {
				album.files.push(file);
			});

			album.save(function(err, album) {
				res.send({
					album: album.viewModel()
				});
			});
		});
	});

module.exports = router;