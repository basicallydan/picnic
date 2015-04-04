import Dropzone from 'dropzone';
import SignInView from './SignInView';
import ModalViewWrapper from './ModalViewWrapper';

var HomepageView = Backbone.View.extend({
	homepageTemplate: require('../../../../views/index.handlebars'),
	events: {
		'click .signInModalLink': 'openSignInModal'
	},
	initialize: function () {
        this.signInView = new SignInView({
            el: this.$('.signInView')[0]
        });
        this.viewState = new Backbone.Model({
        	currentMessageNumber: 0
        });
        this.listenTo(this.viewState, 'change:currentMessageNumber', this.updateDropzoneDragMessage);
	},
	initializeDropzone: function() {
		if (this.dropzone) {
			this.dropzone.destroy();
		}

		this.dropzone = new Dropzone(this.$('#albumDropzone')[0], {
			uploadMultiple: true,
			parallelUploads: 4,
			clickable:false,
			maxFiles: 50,
			thumbnailWidth: 140,
			thumbnailHeight: 140,
			previewTemplate: document.querySelector('#newAlbumImagePreviewTemplate').innerHTML,
			url: '/api/albums'
		});

		let incrementMessage = _.bind(function () {
			let nextMessageNumber = this.viewState.get('currentMessageNumber') + 1;
			if (nextMessageNumber > this.$('#dropzoneMessageOptions div').length - 1) {
				nextMessageNumber = 0;
			}
			this.viewState.set('currentMessageNumber', nextMessageNumber);
		}, this);

		this.dropzone.on('dragend', incrementMessage);
		this.dropzone.on('dragleave', incrementMessage);

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
		this.initializeDropzone();
		this.signInView.delegateEvents();
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	openSignInModal: function (e) {
		e.preventDefault();
		e.stopPropagation();
		let SignInModalView = ModalViewWrapper(SignInView);
		let modalView = new SignInModalView();
		modalView.render().showModal();
		this.listenTo(modalView, 'signedIn', function () {
			modalView.hideModal();
		});
	},
	render: function () {
		let homepageRendered = this.homepageTemplate();
		this.$el.html(homepageRendered);
	},
	updateDropzoneDragMessage: function () {
		let currentMessageNumber = this.viewState.get('currentMessageNumber');
		var element = $(this.$('#dropzoneMessageOptions div')[currentMessageNumber]);
		this.$('#albumDropzone .dz-message-hovered div').html(element.html());
	}
});

export default HomepageView;