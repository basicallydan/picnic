import Dropzone from 'dropzone';
import ZeroClipboard from 'zeroclipboard';
import url from 'url';

var AlbumView = Backbone.View.extend({
	className:'album-view',
	albumTemplate: require('../../../../views/album.handlebars'),
	events: {
		'click #shortLinkCopy':'handleCopyLinkClick',
		'click #deleteAlbum':'handleDeleteLinkClick'
	},
	initialize: function() {
		this.listenTo(this.model.album, 'sync', this.render);
	},
	destroyExistingDropzone: function () {
		if (this.dropzone) {
			this.dropzone.destroy();
		}
	},
	initializeDropzone: function() {
		if (!this.model.album.get('links')) {
			return;
		}

		var newFiles = [];

		this.destroyExistingDropzone();

		if (!this.model.album.get('links').files) {
			return;
		}

		this.dropzone = new Dropzone(this.$('#existingAlbumDropzone')[0], {
			uploadMultiple: false,
			parallelUploads: 6,
			clickable: this.$('#newImageButton').get(0),
			acceptedFiles:'.jpg,.png,.jpeg,.gif',
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

		this.dropzone.on('error', function (file, xhr, formData) {
			console.log('Dropzone error');
		}.bind(this));

		this.dropzone.on('canceled', function (file, xhr, formData) {
			console.log('Dropzone canceled');
		}.bind(this));

		this.dropzone.on('removedfile', function (file, xhr, formData) {
			console.log('Dropzone file removed');
		}.bind(this));

		this.dropzone.on('thumbnail', _.bind(function (file, dataUrl) {
			this.$('#newImagePreviewsContainer .image:contains(' + file.name + ') .image-inner').css({
				backgroundImage: 'url(' + dataUrl + ')'
			});
		}, this));
	},
	handleCopyLinkClick: function (e) {
		this.$('#shortLink').select();
		// var range = document.createRange();
		// range.selectNode(node);
		// window.getSelection().addRange(range);

		try {
			// Now that we've selected the anchor text, execute the copy command  
			var successful = document.execCommand('copy');
			this.$('#shortLink').blur();
			this.$('#shortLinkCopy').addClass('success');
			setTimeout(function () {
				this.$('#shortLinkCopy').removeClass('success');
			}.bind(this), 2000);
			e.preventDefault();
			return;
		} catch (err) {
			console.log('Unable to copy:', err);
		}

		this.$('#shortLink').blur();

		e.preventDefault();

		if (ZeroClipboard.isFlashUnusable()) {
			this.$('.share-hint').removeClass('hidden');
			setTimeout(function () {
				this.$('.share-hint').addClass('hidden');
			}.bind(this), 5000);
		}
	},
	handleDeleteLinkClick: function (e) {
		e.preventDefault();
		// this.stopListening(this.model.album, 'sync');
		this.listenToOnce(this.model.album, 'sync', function () {
			this.trigger('deleted');
		});
		this.model.album.destroy();
	},
	initializeZeroClipboard: function() {
		var that = this;
		if (window.ClipboardEvent || ZeroClipboard.isFlashUnusable()) {
			return;
		}
		if (this.clipboardClient) {
			this.clipboardClient.destroy();
		}
		this.clipboardClient = new ZeroClipboard(this.$('#shortLinkCopy'));
		this.clipboardClient.on('ready', function(readyEvent) {
			this.on('aftercopy', function(copyEvent) {
				that.$('#shortLinkCopy').addClass('success');
				setTimeout(function () {
					this.$('#shortLinkCopy').removeClass('success');
				}.bind(this), 2000);
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
		return Backbone.View.prototype.undelegateEvents.apply(this, arguments);
	}
});

export default AlbumView;