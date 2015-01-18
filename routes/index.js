var express = require('express');
var router = express.Router();
var multer  = require('multer');
var Album = require('../models/Album');
var _ = require('underscore');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Swumo' });
});

router.get('/a/:shortName', function(req, res, next) {
	var album; // This will be a new albumdd
	album = Album.findByShortName(req.params.shortName, function (err, album) {
		res.render('album', album.viewModel());
	});
});

module.exports = router;
