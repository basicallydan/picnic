Dropzone.options.albumDropzone = {
	uploadMultiple: true,
	init: function() {
		this.on('addedfile', function(file) {
			console.log('Added File:', file.name);
		});
		this.on('successmultiple', function(file, response) {
			console.log('File uploaded');
			console.log(response);
			$('#album-url').val(response.links.web);
		});
	}
};