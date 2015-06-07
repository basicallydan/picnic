import Dropzone from 'dropzone';
import shortId from 'shortid';
import AlbumModel from '../models/AlbumModel';

var HomepageView = Backbone.View.extend({
	homepageTemplate: require('../../../../views/index.handlebars'),
	events: {
		'dragend .dz-message-empty': function (e) {
			console.log('Dragend empty done');
		},
		'dragend .dz-message-hovered': function (e) {
			console.log('Dragend hovered done');
		}
	},
	initialize: function () {
        this.viewState = new Backbone.Model({
        	currentMessageNumber: 0,
        	currentShortName: shortId.generate()
        });
        this.listenTo(this.viewState, 'change:currentMessageNumber', this.updateDropzoneDragMessage);
	},
	initializeDropzone: function() {
		if (this.dropzone) {
			this.dropzone.destroy();
		}

		var newAlbum;

		this.viewState.set('currentShortName', shortId.generate());

		function mouseEventOutside(event, $element) {
			var topBound = $element.offset().top;
			var leftBound = $element.offset().left;
			var bottomBound = $element.height() + topBound;
			var rightBound = $element.width() + leftBound;
			return event.pageX > rightBound || event.pageY > bottomBound || event.pageX < leftBound || event.pageY < topBound;
		}

		this.dropzone = new Dropzone(this.$('#albumDropzone')[0], {
			// autoProcessQueue: false,
			uploadMultiple: false,
			acceptedFiles:'.jpg,.png,.jpeg,.gif',
			parallelUploads: 6,
			clickable:this.$('#addImagesButton').get(0),
			maxFiles: 50,
			thumbnailWidth: 500,
			thumbnailHeight: 500,
			previewsContainer: '#newAlbumImagePreviewsContainer',
			previewTemplate: document.querySelector('#newAlbumImagePreviewTemplate').innerHTML,
			url: 'https://api.cloudinary.com/v1_1/dys2lsskw/image/upload',
			dragend: function(e) {
				if (mouseEventOutside(e, $(this.element))) {
					return this.element.classList.remove('dz-drag-hover');
				}
			},
			dragleave: function(e) {
				if (mouseEventOutside(e, $(this.element))) {
					return this.element.classList.remove('dz-drag-hover');
				}
			}
		});

		let incrementMessage = _.bind(function (e) {
			let nextMessageNumber = this.viewState.get('currentMessageNumber') + 1;
			if (nextMessageNumber > this.$('#dropzoneMessageOptions div').length - 1) {
				nextMessageNumber = 0;
			}
			this.viewState.set('currentMessageNumber', nextMessageNumber);
		}, this);

		this.dropzone.on('dragenter', incrementMessage);

		this.dropzone.on('addedfile', _.bind(function (file, response) {
			if (!newAlbum) {
				newAlbum = {
					shortName: this.viewState.get('currentShortName'),
					files: []
				};
			}
		}, this));

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
			newAlbum.files.push(fileObject);
			if (this.dropzone.getQueuedFiles().length === 0 &&
				this.dropzone.getActiveFiles().length === 0) {
				this.collection.albums.create(newAlbum, {
					parse : true,
					success : function (model, response) {
						this.trigger('finishedUpload', response.album.links.web);
					}.bind(this)
				});
			}
		}, this));

		this.dropzone.on('error', function (file, xhr, formData) {
			console.log('Dropzone error');
			if (!file.accepted) {
				this.trigger('notification', {
					type: 'warning',
					message: 'Sorry, you can only upload PNG, JPG or GIF files',
					id: 'typeNotAccepted'
				});
			}
		}.bind(this));

		this.dropzone.on('processing', function (file, xhr, formData) {
			// console.log('Dropzone error');
			if (this.dropzone.getQueuedFiles().length > 0 ||
				this.dropzone.getActiveFiles().length > 0) {
				this.$('#albumDropzone').addClass('dz-populated');
			}
		}.bind(this));

		this.dropzone.on('canceled', function (file, xhr, formData) {
			console.log('Dropzone canceled');
		}.bind(this));

		this.dropzone.on('removedfile', function (file, xhr, formData) {
			console.log('Dropzone file removed');
		}.bind(this));

		this.dropzone.on('sending', function (file, xhr, formData) {
			formData.append('api_key', 976447557551824);
			formData.append('timestamp', Date.now() / 1000 | 0);
			formData.append('upload_preset', 'luv2jxnn');
			formData.append('tags', 'album:' + this.viewState.get('currentShortName'));
		}.bind(this));

		this.dropzone.on('thumbnail', _.bind(function (file, dataUrl) {
			this.$('#newAlbumImagePreviewsContainer .image:contains(' + file.name + ')').css({
				backgroundImage: 'url(' + dataUrl + ')'
			});
		}, this));
	},
	delegateEvents: function () {
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	render: function () {
		let homepageRendered = this.homepageTemplate();
		this.$el.html(homepageRendered);
		this.initializeDropzone();
	},
	updateDropzoneDragMessage: function () {
		let currentMessageNumber = this.viewState.get('currentMessageNumber');
		var element = $(this.$('#dropzoneMessageOptions div')[currentMessageNumber]);
		this.$('#albumDropzone .dz-message-hovered div').html(element.html());
	}
});

export default HomepageView;