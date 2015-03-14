import Backbone from 'backbone';
import $ from 'jquery';

var AlbumView = Backbone.View.extend({
	albumTemplate: require('../../../../views/album.handlebars'),
	initialize: () => {
		this.listenTo(this.model.album, 'sync', this.render);
	},
	render: function () {
		let albumRendered = this.albumTemplate(this.model.album.toJSON());
		this.$el.html(albumsRendered);
	}
});

export default AlbumView;