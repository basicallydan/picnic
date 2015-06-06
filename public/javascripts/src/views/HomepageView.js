import Dropzone from 'dropzone';

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
        	currentMessageNumber: 0
        });
        this.listenTo(this.viewState, 'change:currentMessageNumber', this.updateDropzoneDragMessage);
	},
	initializeDropzone: function() {
		if (this.dropzone) {
			this.dropzone.destroy();
		}

		function mouseEventOutside(event, $element) {
			var topBound = $element.offset().top;
			var leftBound = $element.offset().left;
			var bottomBound = $element.height() + topBound;
			var rightBound = $element.width() + leftBound;
			return event.pageX > rightBound || event.pageY > bottomBound || event.pageX < leftBound || event.pageY < topBound;
		}

		this.dropzone = new Dropzone(this.$('#albumDropzone')[0], {
			// autoProcessQueue: false,
			uploadMultiple: true,
			parallelUploads: 2,
			clickable:this.$('#addImagesButton').get(0),
			maxFiles: 50,
			thumbnailWidth: 500,
			thumbnailHeight: 500,
			previewsContainer: '#newAlbumImagePreviewsContainer',
			previewTemplate: document.querySelector('#newAlbumImagePreviewTemplate').innerHTML,
			url: '/api/albums',
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
			this.$('#albumDropzone').addClass('dz-populated');
		}, this));

		this.dropzone.on('successmultiple', _.bind(function (file, response) {
			if (this.dropzone.getQueuedFiles().length === 0) {
				this.trigger('finishedUpload', response.album.links.web);
			} else {
				this.dropzone.options.url = response.album.links.files;
				this.dropzone.processQueue();
			}
		}, this));

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