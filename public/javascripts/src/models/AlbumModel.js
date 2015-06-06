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
	viewModel: function (options={}) {
		var json = Backbone.Model.prototype.toJSON.apply(this);
		json.files = json.files.toJSON().slice(0, options.limit || undefined);
		return json;
	},
	set: function (name, object, options) {
		var args = [name, object, options];

		if (_.isObject(name) && object.parse) {
			if (_.isObject(args[0])) {
				args[0] = this.parse(args[0]);
			}
		}

		return Backbone.Model.prototype.set.apply(this, args);
	},
	parse: function (response) {
		if (_.isObject(response.album)) {
			response = response.album;
		}

		if (!(response.files instanceof Backbone.Collection)) {
			response.files = new Backbone.Collection(response.files);
			response.files.url = this.url() + '/files/';
		}

		return response;
	}
});

module.exports = AlbumModel;