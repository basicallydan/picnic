import Backbone from 'backbone';
import $ from 'jquery';
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
	},
	initializeDropzone: function() {
		if (this.dropzone) {
			this.dropzone.destroy();
		}

		this.dropzone = new Dropzone(this.$('#albumDropzone')[0], {
			uploadMultiple: true,
			parallelUploads: 6,
			clickable:false,
			maxFiles: 6,
			previewTemplate: document.querySelector('#newAlbumImagePreviewTemplate').innerHTML,
			url: '/api/albums'
		});

		this.dropzone.on('successmultiple', (file, response) => {
			Backbone.history.navigate(response.album.links.web, {
				trigger: true
			});
		});
	},
	delegateEvents: function () {
		this.signInView.delegateEvents();
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	openSignInModal: function (e) {
		e.preventDefault();
		e.stopPropagation();
		let SignInModalView = ModalViewWrapper(SignInView);
		let modalView = new SignInModalView();
		modalView.render().showModal();
	},
	render: function () {
		let homepageRendered = this.homepageTemplate();
		this.$el.html(homepageRendered);
	}
});

export default HomepageView;