import Backbone from 'backbone';
import $ from 'jquery';
import Dropzone from 'dropzone';

var AlbumView = Backbone.View.extend({
	albumTemplate: require('../../../../views/album.handlebars'),
	initialize: function() {
		this.listenTo(this.model.album, 'sync', this.render);
	},
	initializeDropzone: function() {
		if (!this.model.album.get('links')) {
			return;
		}

		if (this.dropzone) {
			this.dropzone.destroy();
		}

		this.dropzone = new Dropzone(this.$('#existingAlbumDropzone')[0], {
			uploadMultiple: true,
			parallelUploads: 6,
			maxFiles: 6,
			previewTemplate: document.querySelector('#newImagePreviewTemplate').innerHTML,
			url: this.model.album.get('links').files
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
		this.initializeDropzone();
	}
});

export default AlbumView;