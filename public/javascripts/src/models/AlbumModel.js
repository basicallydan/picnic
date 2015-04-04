var AlbumModel = Backbone.Model.extend({
	url: function () {
		return '/api/albums/' + this.id;
	},
	idAttribute:'shortName',
	parse: function (response) {
		if (_.isObject(response.album)) {
			return response.album;	
		}
		return response;
	}
});

module.exports = AlbumModel;