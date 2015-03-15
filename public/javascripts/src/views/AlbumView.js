import Backbone from 'backbone';
import $ from 'jquery';
import Dropzone from 'dropzone';

var AlbumView = Backbone.View.extend({
	albumTemplate: require('../../../../views/album.handlebars'),
	initialize: function() {
		this.listenTo(this.model.album, 'sync', this.render);
	},
	initializeDropzone: function() {
		this.dropzone = new Dropzone(this.$('#existingAlbumDropzone')[0], {
			uploadMultiple: true,
			parallelUploads: 6,
			maxFiles: 6,
			url: this.model.album.get('links').self
		});
		this.dropzone.on('success', (file, response) => {
			this.model.album.set(response);
			this.render();
		});
		this.dropzone.on('successmultiple', (file, response) => {
			this.model.album.set(response);
			this.render();
		});
	},
	render: function() {
		let albumRendered = this.albumTemplate(this.model.album.toJSON());
		this.$el.html(albumRendered);
	}
});

export default AlbumView;