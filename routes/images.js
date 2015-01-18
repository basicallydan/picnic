var express = require('express');
var router = express.Router();
// var fileupload = require('fileupload').createFileUpload('./uploads').middleware;
var multer  = require('multer');

/* POST images listing. */
router.post('/', multer({ dest: './uploads/'}), function(req, res, next) {
	console.log(req.files);
	res.send({
		message: 'Done',
		files: req.files
	});
});

module.exports = router;