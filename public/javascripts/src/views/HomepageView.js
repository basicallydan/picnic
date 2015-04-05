import Dropzone from 'dropzone';
import SignInView from './SignInView';
import ModalViewWrapper from './ModalViewWrapper';

var HomepageView = Backbone.View.extend({
	homepageTemplate: require('../../../../views/index.handlebars'),
	events: {
		'click .signInModalLink': 'openSignInModal',
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
			uploadMultiple: true,
			parallelUploads: 2,
			clickable:false,
			maxFiles: 50,
			thumbnailWidth: 140,
			thumbnailHeight: 140,
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
			if (/dz-message/g.test(e.toElement.className)) {
				return;
			}
			let nextMessageNumber = this.viewState.get('currentMessageNumber') + 1;
			if (nextMessageNumber > this.$('#dropzoneMessageOptions div').length - 1) {
				nextMessageNumber = 0;
			}
			this.viewState.set('currentMessageNumber', nextMessageNumber);
		}, this);

		this.dropzone.on('dragenter', incrementMessage);

		this.dropzone.on('successmultiple', _.bind(function (file, response) {
			if (this.dropzone.getQueuedFiles().length === 0) {
				Backbone.history.navigate(response.album.links.web, {
					trigger: true
				});
			} else {
				this.dropzone.options.url = response.album.links.files;
				this.dropzone.processQueue();
			}
		}, this));
	},
	delegateEvents: function () {
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	openSignInModal: function (e) {
		e.preventDefault();
		e.stopPropagation();
		let SignInModalView = ModalViewWrapper(SignInView);
		let modalView = new SignInModalView();
		modalView.render().showModal();
		this.listenTo(modalView, 'signedIn', function () {
			this.trigger('notification', {
				type: 'success',
				message: 'Congrats on signing in!'
			});
			modalView.hideModal();
		});
	},
	render: function () {
		let homepageRendered = this.homepageTemplate();
		this.initializeDropzone();
		this.$el.html(homepageRendered);
	},
	updateDropzoneDragMessage: function () {
		let currentMessageNumber = this.viewState.get('currentMessageNumber');
		var element = $(this.$('#dropzoneMessageOptions div')[currentMessageNumber]);
		this.$('#albumDropzone .dz-message-hovered div').html(element.html());
	}
});

export default HomepageView;