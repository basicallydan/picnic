var AlbumModel = Backbone.Model.extend({
	url: function () {
		return '/api/albums/' + this.get('shortName');
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
	set: function (name, object, options = {}) {
		if (_.isObject(name)) {
			options = object;
			object = name;
		}

		if (options.parse) {
			object = this.parse(object);
		}

		if (arguments.length === 3) {
			return Backbone.Model.prototype.set.call(this, name, object, options);
		} else {
			return Backbone.Model.prototype.set.call(this, object, options);
		}
	},
	parse: function (response) {
		if (_.isObject(response.album)) {
			response = response.album;
		}

		if (!(response.files instanceof Backbone.Collection)) {
			response.files = new Backbone.Collection(response.files);			
		}

		return response;
	}
});

module.exports = AlbumModel;