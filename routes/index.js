var express = require('express');
var router = express.Router();
var multer = require('multer');
var auth = require('../middleware/auth');
var Album = require('../models/Album');
var User = require('../models/User');
var _ = require('underscore');

/* GET home page. */
router.get('/', auth({ required : false }), function(req, res, next) {
	res.render('index', {
		title: 'Picnic',
		user: req.userViewModel
	});
});

/**
 * All albums with user's ownership code
 */
router.get('/a', auth({ required : false }), function(req, res, next) {
	var ownershipCode = req.query.ownershipCode || req.cookies.ownershipCode;
	var user = req.user;
	if (!user && ownershipCode) {
		console.log('Looking for albums with ownershipCode', ownershipCode);
		Album.findActiveByOwnershipCode(ownershipCode, function(err, albums) {
			var albumViewModels = _.map(albums, function(album) {
				return album.viewModel(undefined, { user : req.user });
			});
			res.render('albums', { title : 'My Albums', albums : albumViewModels, user: req.user.viewModel() });
		});
	} else if (user) {
		console.log('Looking for albums with user', user.email);
		Album.findActiveByOwner(user, function(err, albums) {
			console.log('Found', albums.length, 'albums owned by user', user.username);
			var albumViewModels = _.map(albums, function(album) {
				return album.viewModel(undefined, { user : req.user });
			});
			res.render('albums', { albums : albumViewModels, user: req.user.viewModel() });
		});
	} else {
		res.render('albums', []);
	}
});

router.get('/a/:shortName', auth({ required : false }), function(req, res, next) {
	Album.findByShortName(req.params.shortName, function(err, album) {
		var responseObject = { title : 'Album', user: req.user };
		if (album) {
			responseObject.album = album.viewModel(undefined, { user : req.user });
		}
		res.render('album', responseObject);
	});
});

router.get('/a/:shortName/images/:imageShortName', auth({
	required: false
}), function(req, res, next) {
	Album.findByShortName(req.params.shortName, function(err, album) {
		var responseObject = {
			title: 'Image',
			user: req.user
		};
		var albumViewModel = album.viewModel(undefined, { user : req.user });
		var file = _.find(albumViewModel.files,
			function(f) {
				return f.shortName === req.params.imageShortName;
			});
		if (album) {
			responseObject.album = album.viewModel(undefined, { user : req.user });
		}
		if (file) {
			responseObject.file = file;
		}
		res.render('image', responseObject);
	});
});

router.get('/sign-in', auth({ required : false }), function(req, res, next) {
	res.render('signIn', {
		title: 'Picnic - Sign in',
		user: req.userViewModel
	});
});

router.get('/profile', auth({ required : true }), function(req, res, next) {
	res.render('profile', {
		title: 'Picnic - User profile',
		user: req.userViewModel
	});
});

router.get('/profile/password', auth({ required : true }), function(req, res, next) {
	res.render('profile', {
		title: 'Picnic - User profile',
		user: req.userViewModel
	});
});

router.get('/sign-out', auth({ required : false }), function(req, res, next) {
	req.logout();
	res.redirect('/');
});

module.exports = router;