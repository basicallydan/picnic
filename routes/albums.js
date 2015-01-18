var express = require('express');
var router = express.Router();
var multer  = require('multer');
var Album = require('../models/Album');

/* POST albums listing. */
router.post('/', multer({ dest: './uploads/'}), function(req, res, next) {
	var album; // This will be a new album
	console.log(req.files);
	album = new Album({
		files: req.files
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