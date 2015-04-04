import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import Dropzone from 'dropzone';
import ZeroClipboard from 'zeroclipboard';

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

		this.dropzone.on('success', _.bind(function (file, response) {
			this.model.album.set(response.album);
			this.render();
		}, this));
		
		this.dropzone.on('successmultiple', _.bind(function (file, response) {
			this.model.album.set(response.album);
			this.render();
		}, this));
	},
	render: function() {
		let albumRendered = this.albumTemplate({ album : this.model.album.toJSON() });
		this.$el.html(albumRendered);
		this.initializeDropzone();
	},
	/* EVENTS */
	delegateEvents: function () {
		if (this.clipboardClient) {
			this.clipboardClient.destroy();
		}
		this.clipboardClient = new ZeroClipboard(this.$('#shortLinkCopy')[0]);
		this.clipboardClient.on('ready', _.bind(function (readyEvent) {
			this.clipboardClient.on('aftercopy', function (copyEvent) {
				console.log('Copied');
			});
		}, this));
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	undelegateEvents: function () {
		if (this.clipboardClient) {
			this.clipboardClient.destroy();
		}
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	}
});

export default AlbumView;