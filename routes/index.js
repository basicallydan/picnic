var express = require('express');
var router = express.Router();
var multer = require('multer');
var Album = require('../models/Album');
var User = require('../models/User');
var _ = require('underscore');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Swumo'
	});
});

router.get('/a', function(req, res, next) {
	var ownershipCode = req.query.ownershipCode || req.cookies.ownershipCode;
	console.log('Looking for albums with ownershipCode', ownershipCode);
	album = Album.findByOwnershipCode(ownershipCode, function (err, albums) {
		var albumViewModels = _.map(albums, function (album) {
			return album.viewModel();
		});
		res.render('albums', albumViewModels);
	});
});

router.get('/a/:shortName', function(req, res, next) {
	var album; // This will be a new albumdd
	album = Album.findByShortName(req.params.shortName, function(err, album) {
		res.render('album', album.viewModel());
	});
});

module.exports = router;