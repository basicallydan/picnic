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

		var newFiles = [];

		if (this.dropzone) {
			this.dropzone.destroy();
		}

		this.dropzone = new Dropzone(this.$('#existingAlbumDropzone')[0], {
			uploadMultiple: false,
			parallelUploads: 6,
			clickable: this.$('#newImageButton').get(0),
			maxFiles: 50,
			thumbnailWidth: 140,
			thumbnailHeight: 140,
			previewsContainer: '#newImagePreviewsContainer',
			previewTemplate: document.querySelector('#newImagePreviewTemplate').innerHTML,
			url: 'https://api.cloudinary.com/v1_1/dys2lsskw/image/upload'
		});

		this.dropzone.on('success', _.bind(function (file, response) {
			var fileObject = {
				name: file.name,
				size: response.bytes,
				format: response.format,
				createdAt: response.created_at,
				width: response.width,
				height: response.height,
				cloudinary: {
					id: response.public_id,
					version: response.version,
					signature: response.signature,
					tags: response.tags
				}
			};
			newFiles.push(fileObject);
			if (this.dropzone.getQueuedFiles().length === 0 &&
				this.dropzone.getActiveFiles().length === 0) {
				Backbone.sync('create', this.model.album.attributes.files, {
					attrs: {
						files: newFiles
					},
					parse : true,
					url: this.model.album.url() + '/files/',
					success : function (response) {
						this.model.album.set(response.album, { parse : true });
						this.render();
					}.bind(this)
				});
			}
		}, this));

		this.dropzone.on('sending', function (file, xhr, formData) {
			formData.append('api_key', 976447557551824);
			formData.append('timestamp', Date.now() / 1000 | 0);
			formData.append('upload_preset', 'luv2jxnn');
			formData.append('tags', 'album:' + this.model.album.get('shortName'));
		}.bind(this));

		this.dropzone.on('thumbnail', _.bind(function (file, dataUrl) {
			this.$('#newImagePreviewsContainer .image:contains(' + file.name + ') .image-inner').css({
				backgroundImage: 'url(' + dataUrl + ')'
			});
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
		var existingClipboardSection = [];

		if (this.clipboardClient) {
			existingClipboardSection = this.$('.short-link-form');
		}

		this.$el.html(albumRendered);

		if (existingClipboardSection.length) {
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