var AlbumView = Backbone.View.extend({
	className:'image-view',
	albumTemplate: require('../../../../views/image.handlebars'),
	initialize: function() {
		this.viewState = new Backbone.Model();
		this.listenTo(this.viewState, 'change:loadedImage', this.updateRenderedImage);
		// this.listenTo(this.model.album, 'sync', this.render);
	},
	render: function() {
		let albumRendered = this.albumTemplate({
			album: this.model.album.toJSON()
		});
	},
	updateRenderedImage: function () {
		let loadedImage = this.viewState.get('loadedImage');
	}
});

export default AlbumView;