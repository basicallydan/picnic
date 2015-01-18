var Dropzone = require('dropzone');
var $ = require('jquery');
var albumTemplate = require('../../views/album.handlebars');

Dropzone.options.albumDropzone = {
	uploadMultiple: true,
	init: function() {
		this.on('addedfile', function(file) {
			console.log('Added File:', file.name);
		});
		this.on('successmultiple', function(file, response) {
			console.log('File uploaded');
			console.log(response);
			var albumRendered = albumTemplate(response);
			history.pushState(response, '', response.links.web);
			$('#page-container').html(albumRendered);
		});
	}
};