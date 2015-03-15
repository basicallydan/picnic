import Backbone from 'backbone';
import $ from 'jquery';

var AlbumView = Backbone.View.extend({
	albumTemplate: require('../../../../views/album.handlebars'),
	initialize: function () {
		this.listenTo(this.model.album, 'sync', this.render);
	},
	render: function () {
		let albumRendered = this.albumTemplate(this.model.album.toJSON());
		this.$el.html(albumRendered);
	}
});

export default AlbumView;