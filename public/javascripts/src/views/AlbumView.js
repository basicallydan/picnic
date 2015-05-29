import Dropzone from 'dropzone';
import ZeroClipboard from 'zeroclipboard';
import url from 'url';

var AlbumView = Backbone.View.extend({
	className:'album-view',
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
			parallelUploads: 4,
			clickable: this.$('#newImageButton').get(0),
			maxFiles: 50,
			thumbnailWidth: 140,
			thumbnailHeight: 140,
			previewTemplate: document.querySelector('#newImagePreviewTemplate').innerHTML,
			url: this.model.album.get('links').files
		});

		this.dropzone.on('success', _.bind(function(file, response) {
			if (this.dropzone.getQueuedFiles().length === 0) {
				this.model.album.set(response.album, { parse : true });
				this.render();
			} else {
				this.dropzone.processQueue();
			}
		}, this));

		this.dropzone.on('successmultiple', _.bind(function(file, response) {
			if (this.dropzone.getQueuedFiles().length === 0) {
				this.model.album.set(response.album, { parse : true });
				this.render();
			} else {
				this.dropzone.processQueue();
			}
		}, this));
	},
	initializeZeroClipboard: function() {
		if (this.clipboardClient) {
			this.clipboardClient.destroy();
		}
		this.clipboardClient = new ZeroClipboard(this.$('#shortLinkCopy'));
		this.clipboardClient.on('ready', function(readyEvent) {
			this.on('aftercopy', function(copyEvent) {
				console.log('Copied');
			});
		});
	},
	render: function() {
		let albumRendered = this.albumTemplate({
			album: this.model.album.toJSON()
		});
		var existingClipboardSection;

		if (this.clipboardClient) {
			existingClipboardSection = this.$('.short-link-form');
		}

		this.$el.html(albumRendered);

		if (existingClipboardSection) {
			this.$('.short-link-form').replaceWith(existingClipboardSection);
		} else {
			this.initializeZeroClipboard();
		}

		this.initializeDropzone();
		this.updateCopyLink();
	},
	updateCopyLink: function () {
		let currentURL = url.parse(document.location.href);
		let fullCopyURL = url.resolve(currentURL.protocol + '//' + currentURL.host, this.model.album.get('links').web);
		this.$('#shortLink').val(fullCopyURL);
		this.$('#shortLinkCopy').attr('data-clipboard-text', fullCopyURL);
	},
	/* EVENTS */
	delegateEvents: function() {
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	undelegateEvents: function() {
		if (this.clipboardClient) {
			this.clipboardClient.destroy();
		}
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	}
});

export default AlbumView;