var express = require('express');
var router = express.Router();
// var fileupload = require('fileupload').createFileUpload('./uploads').middleware;
var multer  = require('multer');
var Album = require('../models/Album');

/* POST images listing. */
router.post('/', multer({ dest: './uploads/'}), function(req, res, next) {
	var album; // This will be a new album
	console.log(req.files);
	// album = new Album({
	// 	files: 
	// })
	res.send({
		message: 'Done',
		files: req.files
	});
});

module.exports = router;