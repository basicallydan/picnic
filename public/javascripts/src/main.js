var Dropzone = require('dropzone');
var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('lodash');
Backbone.$ = $;
var AlbumModel = require('./models/AlbumModel');
var albumTemplate = require('../../../views/album.handlebars');
var albumListTemplate = require('../../../views/albums.handlebars');
var Router = require('./Router');
var router;

$(document).ready(() => {
	router = new Router();
});