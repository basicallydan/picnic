var AlbumModel = Backbone.Model.extend({
	url: function () {
		return '/api/albums/' + this.id;
	},
	idAttribute:'shortName',
	getFileWithShortname: function (shortName) {
		return this.get('files').findWhere({ shortName : shortName });
	},
	toJSON: function () {
		var json = Backbone.Model.prototype.toJSON.apply(this);
		json.files = json.files.toJSON();
		return json;
	},
	parse: function (response) {
		if (_.isObject(response.album)) {
			response = response.album;
		}

		response.files = new Backbone.Collection(response.files);

		return response;
	}
});

module.exports = AlbumModel;