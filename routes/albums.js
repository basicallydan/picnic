var express = require('express');
var router = express.Router();
var multer  = require('multer');
var Album = require('../models/Album');
var _ = require('underscore');

/* POST albums listing. */
router.post('/', multer({ dest: './uploads/'}), function(req, res, next) {
	var album; // This will be a new album
	var files = [];
	if (!(req.files instanceof Array)) {
		console.log('That ain\'t no array!');
		files = _.map(req.files, function (file) {
			return file;
		});
	} else {
		files = req.files;
	}
	album = new Album({
		files: files
	});
	album.save(function (err, album) {
		res.send(album.viewModel());
	});
});

/* POST albums listing. */
router.post('/:shortName', function(req, res, next) {
	var album; // This will be a new album
	console.log('Looking for albums with shortname', req.params.shortName);
	album = Album.findByShortName(req.params.shortName, function (err, album) {
		res.send(album.viewModel());
	});
});

module.exports = router;