import Backbone from 'backbone';
import $ from 'jquery';

var AlbumsView = Backbone.View.extend({
	albumsTemplate: require('../../../../views/albums.handlebars'),
	initialize: function () {
		this.listenTo(this.collection.albums, 'sync', this.render);
	},
	render: function () {
		let albumsRendered = this.albumsTemplate({
			albums : this.collection.albums.toJSON()
		});
		this.$el.html(albumsRendered);
	}
});

export default AlbumsView;