var AlbumView = Backbone.View.extend({
	className:'image-view',
	imageTemplate: require('../../../../views/image.handlebars'),
	initialize: function() {
		this.viewState = new Backbone.Model();
		this.listenTo(this.viewState, 'change:loadedImage', this.updateRenderedImage);
	},
	render: function() {
		let imageRendered = this.imageTemplate({
			file: this.model.file.toJSON(),
			album: this.model.album.toJSON()
		});
		this.$el.html(imageRendered);
	},
	updateLoadedImage: function () {
		let album = this.model.album.toJSON();

	},
	updateRenderedImage: function () {
		let loadedImage = this.viewState.get('loadedImage');
	}
});

export default AlbumView;