var Dropzone = require('dropzone');
var $ = require('jquery');
var albumTemplate = require('../../views/album.handlebars');
var albumListTemplate = require('../../views/albums.handlebars');
var _ = require('lodash');

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
			history.pushState(response, '', response.album.links.web);
			$('#page-container').html(albumRendered);
		});
	}
};

function goToAlbumsPage() {
	$.ajax('/api/albums', {
		method: 'get',
	}).done(function(response) {
		console.log('Albums loaded:', response);
		var albumsRendered = albumListTemplate(response);
		history.pushState(response, '', response.links.web);
		$('#page-container').html(albumsRendered);
	}).fail(function(response) {
		console.log('Error:', response);
	});
}

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
			data: userPostData
		}).done(function(response) {
			goToAlbumsPage();
		}).fail(function(response) {
			console.log('Failed');
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
			data: userPostData
		}).done(function(response) {
			goToAlbumsPage();
		}).fail(function(response) {
			console.log('Failed');
		});
	});
}

$(document).ready(function() {
	setupUserForm();
	setupSignInForm();
});