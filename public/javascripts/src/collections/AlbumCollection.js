import AlbumModel from '../models/AlbumModel';

var AlbumCollection = Backbone.Collection.extend({
	model: AlbumModel,
	url: function () {
		return '/api/albums/';
	},
	parse: function (response) {
		return response.albums;
	},
// 	create: function (attributes, options) {
// 		var args = [attributes, options];

// 		if (_.isObject(name) && object.parse) {
// 			if (_.isObject(args[0])) {
// 				args[0] = this.parse(args[0]);
// 			}
// 		}

// 		return Backbone.Collection.prototype.create.apply(this, args);
// 	},
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