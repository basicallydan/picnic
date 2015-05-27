import AlbumModel from '../models/AlbumModel';

var AlbumCollection = Backbone.Collection.extend({
	model: AlbumModel,
	url: function () {
		return '/api/albums/';
	},
	parse: function (response) {
		return response.albums;
	},
	viewModel: function (options={}) {
		let viewModel = this.map((album) => {
			return album.viewModel({
				limit: options.fileLimit
			});
		});
		return viewModel;
	}
});

export default AlbumCollection;