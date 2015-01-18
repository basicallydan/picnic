var express = require('express');
var router = express.Router();

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
