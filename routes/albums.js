var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require('../middleware/auth');
var passport = require('passport');
var Album = require('../models/Album');
var User = require('../models/User');
var File = require('../models/File.js');
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

function streamFileRequestToCloudinary(req, callback) {
	var form = new multiparty.Form();
	var fileCount = 0;
	var filesUploaded = [];
	var doneWithUserRequests = false;

	var finish = function () {
		if (filesUploaded.length === fileCount && doneWithUserRequests) {
			callback(null, filesUploaded);
		}
	};

	form.on('part', function(part) {
		var filename;
		var cloudStream = cloudinary.uploader.upload_stream(function(response) {
			console.log('Finished uploading', part.name, '(' + filename + ') to cloudinary.');
			console.log('Cloudinary response:');
			console.log(JSON.stringify(response, null, 2));
			var fileObject = {
				name: filename,
				size: response.bytes,
				format: response.format,
				createdAt: response.created_at,
				width: response.width,
				height: response.height,
				cloudinary: {
					id: response.public_id,
					version: response.version,
					signature: response.signature
				}
			};
			filesUploaded.push(fileObject);
			cloudStream.end();
			finish();
		});

		if (!part.filename) {
			console.log('Got field named ', part.name + '.');
			part.resume();
		}

		if (part.filename) {
			filename = part.filename;
			console.log('Got file named', part.name, 'with name', part.filename + '.');
			fileCount++;
			part.pipe(cloudStream);
			// part.resume();
		}

		part.on('error', function(err) {
			console.log('Error with uploaded files');
			console.error(err);
		});
	});

	// Close emitted after form parsed
	form.on('close', function() {
		console.log('Finished with user upload.');
		doneWithUserRequests = true;
		finish();
	});

	form.parse(req);
}

/* POST albums listing. */
router.post('/', auth({
	required: false
}), function(req, res, next) {
	var newAlbumOptions = {};

	if (req.user) {
		newAlbumOptions.owner = req.user;
	} else if (req.cookies.ownershipCode) {
		newAlbumOptions.ownershipCode = req.cookies.ownershipCode;
	}

	newAlbumOptions.shortName = req.body.shortName;

	File.collection.insert(req.body.files, function (err, files) {
		newAlbumOptions.files = files;
		album = new Album(newAlbumOptions);

		album.saveCascade(function(err, album) {
			Album.populate(album, { path : 'files' }, function (err, album) {
				res.cookie('ownershipCode', album.ownershipCode);
				res.send({ album : album.viewModel(undefined, { user : req.user }) });
			});
		});
	});
});

router.get('/', auth({
	required: false
}), function(req, res, next) {
		var ownershipCode = req.query.ownershipCode || req.cookies.ownershipCode;
		var user = req.user;
		if (!user && ownershipCode) {
			console.log('Looking for albums with ownershipCode', ownershipCode);
			Album.findActiveByOwnershipCode(ownershipCode, function(err, albums) {
				var albumViewModels = _.map(albums, function(album) {
					return album.viewModel(undefined, { user : req.user });
				});
				res.send({
					albums: albumViewModels,
					links: {
						web: '/a'
					}
				});
			});
		} else if (user) {
			console.log('Looking for albums with ownershipCode', ownershipCode);
			Album.findActiveByOwner(user, function(err, albums) {
				console.log('Found', albums.length, 'albums owned by user', user.username);
				var albumViewModels = _.map(albums, function(album) {
					return album.viewModel(undefined, { user : req.user });
				});
				res.send({
					albums: albumViewModels,
					links: {
						web: '/a'
					}
				});
			});
		} else {
			res.send({
				albums:[],
				links: {
					web: '/a'
				}
			});
		}
	});

router.put('/:shortName', function(req, res, next) {
	var newAlbumOptions = {};

	newAlbumOptions.shortName = req.params.shortName;
	newAlbumOptions.files = req.body.files;

	if (req.user) {
		newAlbumOptions.owner = req.user;
		req.body.files.forEach(function (f) {
			f.owner = req.user;
		});
	} else if (req.cookies.ownershipCode) {
		newAlbumOptions.ownershipCode = req.cookies.ownershipCode;
		req.body.files.forEach(function (f) {
			f.ownershipCode = req.cookies.ownershipCode;
		});
	}

	File.collection.insert(req.body.files, function (err, files) {
		newAlbumOptions.files = files;
		console.log('Saving', newAlbumOptions);
		album = new Album(newAlbumOptions);
		console.log('Saving', album);

		album.saveCascade(function(err, album) {
			console.log('Saved', album);
			Album.populate(album, { path : 'files' }, function (err, album) {
				res.cookie('ownershipCode', album.ownershipCode);
				res.send({ album : album.viewModel(undefined, { user : req.user }) });
			});
		});
	});
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

			user = User.findActiveByEmail(email, function(err, user) {
				if (!user) {
					user = new User({
						email: email
					});
					user.save(function(err, user) {
						album.transferOwnership(user);
						album.saveCascade(function(err, user) {
							res.send({
								album: album.viewModel(undefined, { user : req.user })
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
			console.log('Found', album);
			res.send({
				album: album.viewModel(undefined, { user : req.user })
			});
		} else {
			res.status(404);
			res.send({
				message: 'Album with shortname' + req.params.shortname + ' could not be found'
			});
		}
	});
});

router.delete('/:shortName', auth({
	required: true
}), function(req, res, next) {
	Album.findByShortName(req.params.shortName, function(err, album) {
		if (!album) {
			res.status(404);
			return res.send({
				message: 'Album with shortname' + req.params.shortname + ' could not be found'
			});
		}

		console.log(req.user);

		if (!req.user || !album.ownedBy(req.user)) {
			res.status(403);
			return res.send({
				message: 'The authenticated user does not have permission to delete this album'
			});
		}

		album.softDelete();
		album.saveCascade(function () {
			res.status(200);
			res.send({
				album : album.viewModel(undefined, { user : req.user })
			});
		});
	});
});

router.post('/:shortName/files', auth({
	required: false
}), function(req, res, next) {
	Album.findByShortName(req.params.shortName, function(err, album) {
		if (!album) {
			res.status(404);
			return res.send({
				message: 'Album with shortname' + req.params.shortname + ' could not be found'
			});
		}


		File.collection.insert(req.body.files, function (err, files) {
			console.log('Adding', files.length, 'files to the album');

			files.forEach(function(file) {
				album.files.push(file);
			});

			album.saveCascade(function(err, album) {
				Album.populate(album, { path : 'files' }, function (err, album) {
					res.cookie('ownershipCode', album.ownershipCode);
					res.send({ album : album.viewModel(undefined, { user : req.user }) });
				});
			});
		});
	});
});

module.exports = router;
