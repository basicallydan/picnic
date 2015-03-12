var Backbone = require('backbone');
var $ = require('jquery');

var AlbumView = Backbone.View.extend({
	albumTemplate: require('../../../../views/album.handlebars'),
	initialize: function () {
		this.listenTo(this.model.album, 'sync', this.render);
	},
	render: function () {
		let albumRendered = this.albumTemplate(this.model.album.toJSON());
		$('#page-container').html(albumRendered);
	}
});

export default AlbumView;