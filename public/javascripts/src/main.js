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
	parallelUploads: 6,
	maxFiles: 6,
	init: function() {
		this.on('successmultiple', function(file, response) {
			Backbone.history.navigate(response.album.links.web, {
				trigger: true
			});
		});
	}
};

$(document).ready(() => {
});