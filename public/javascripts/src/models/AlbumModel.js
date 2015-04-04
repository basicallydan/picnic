var Backbone = require('backbone');

var AlbumModel = Backbone.Model.extend({
	url: function () {
		return '/api/albums/' + this.id;
	},
	idAttribute:'shortName',
	parse: function (response) {
		return response.album;
	}
});

module.exports = AlbumModel;