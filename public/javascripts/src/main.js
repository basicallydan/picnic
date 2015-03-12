var Dropzone = require('dropzone');
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var AlbumModel = require('./models/AlbumModel');
var albumTemplate = require('../../../views/album.handlebars');
var albumListTemplate = require('../../../views/albums.handlebars');
var _ = require('lodash');
var Router = require('./Router');
var router = new Router();

Dropzone.options.albumDropzone = {
	uploadMultiple: true,
	init: function() {
		this.on('successmultiple', function(file, response) {
			Backbone.history.navigate(response.album.links.web, { trigger : true });
		});
	}
};

function goToAlbumsPage() {
	$.ajax('/api/albums', {
		method: 'get',
	}).done((response) => {
		console.log('Albums loaded:', response);
		var albumsRendered = albumListTemplate(response);
		history.pushState(response, '', response.links.web);
		$('#page-container').html(albumsRendered);
	}).fail(function(response) {
		console.log('Error:', response);
	});
}

function setupUserForm() {
	$('#signUpForm').submit((e) => {
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

$(document).ready(() => {
	setupUserForm();
	setupSignInForm();
});