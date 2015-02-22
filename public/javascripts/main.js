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

function setupUserForm() {
	$('#signUpForm').submit(function(e) {
		e.preventDefault();
		var userPostData = $(this).serializeArray();
		userPostData[2] = {
			name: 'username',
			value: $(this.elements.email).val()
		};
		$.ajax('/api/users', {
			method: 'post',
			data: userPostData,
			success: function() {
				console.log('Done');
			},
			error: function() {
				console.log('Failed');
			}
		});
	});
}

function setupSignInForm() {
	$('#signInForm').submit(function(e) {
		e.preventDefault();
		var userPostData = $(this).serializeArray();
		userPostData[2] = {
			name: 'username',
			value: $(this.elements.email).val()
		};
		$.ajax('/api/users/authenticate', {
			method: 'post',
			data: userPostData,
			success: function() {
				console.log('Done');
			},
			error: function() {
				console.log('Failed');
			}
		});
	});
}

$(document).ready(function() {
	setupUserForm();
	setupSignInForm();
});