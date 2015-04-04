import Backbone from 'backbone';
import AlbumModel from '../models/AlbumModel';
import _ from 'underscore';

var AlbumCollection = Backbone.Collection.extend({
	model: AlbumModel,
	url: function () {
		return '/api/albums/';
	},
	parse: function (response) {
		return response.albums;
	},
	viewModel: function () {
		let viewModel = this.toJSON();
		return viewModel;
	}
});

export default AlbumCollection;