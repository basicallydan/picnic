import Dropzone from 'dropzone';
import AlbumListView from './AlbumListView';
import AlbumView from './AlbumView';
import ImageView from './ImageView';
import HomepageView from './HomepageView';
import ModalViewWrapper from './ModalViewWrapper';
import SignInView from './SignInView';
import SignUpView from './SignUpView';

var NotificationView = Backbone.View.extend({
	events: {
		'click': 'remove'
	},
	render: function () {
		this.undelegateEvents();
		this.$el = $('<li></li>');
		this.$el.addClass('notification');
		var notification = this.model.notification;
		this.$el.text(notification.message);
		if (notification.type === 'success') {
			this.$el.addClass('success');
		} else if (notification.type === 'error') {
			this.$el.addClass('error');
		} else if (notification.type === 'info') {
			this.$el.addClass('info');
		} else if (notification.type === 'warning') {
			this.$el.addClass('warning');
		}
		this.delegateEvents();
		return this;
	},
	remove: function () {
		this.$el.addClass('removed');
		setTimeout(_.bind(Backbone.View.prototype.remove, this), 460);
	}
});

var ContainerView = Backbone.View.extend({
	events: {
		'click a[href$="/sign-in"]': 'openSignInModal',
		'click a[href$="/sign-up"]': 'openSignUpModal',
		'click .internal-link' : 'handleInternalLink',
		'mousedown .autohighlight': 'highlightShortLink',
		'click .autohighlight': 'highlightShortLink',
		'keypress .no-edit': 'preventEditing',
		'keyup .no-edit': 'preventEditing',
		'keydown .no-edit': 'preventEditing'
	},
	initialize: function () {
		console.log('Starting model:', this.model);
		console.log('Starting collection:', this.collection);

		this.currentDomainRegex = new RegExp('^' + window.location.origin);

		this.notificationViews = [];

		this.viewState = new Backbone.Model({
			firstLoad: true
		});

		this.albumListView = new AlbumListView({
			el: this.$('#page-container')[0],
			collection: this.collection
		});

		this.albumView = new AlbumView({
			el: this.$('#page-container')[0],
			model: this.model
		});

		this.imageView = new ImageView({
			el: this.$('#page-container')[0],
			model: this.model
		});

		this.homepageView = new HomepageView({
			el: this.$('#page-container')[0]
		});

		this.listenTo(this.homepageView, 'notification', this.showNotification);
		this.listenTo(this.homepageView, 'finishedUpload', function (url) {
			this.navigateInternalLink(url);
		});
	},
	showNotification: function (notification) {
		var newNotificationView = new NotificationView({
			model: {
				notification: notification
			}
		});
		this.notificationViews.push(newNotificationView);
		this.$('#notifications').append(newNotificationView.render().$el);
	},
	handleInternalLink: function (e) {
		var link = $(e.currentTarget);
		var url = link.attr('href');
		e.preventDefault();
		this.navigateInternalLink(url);
	},
	navigateInternalLink: function (url) {
		url = url.replace(this.currentDomainRegex, '');
		Backbone.history.navigate(url, { trigger : true });
	},
	shouldFetch: function () {
		return !this.viewState.get('firstLoad');
	},
	showAlbumListView: function () {
		this.loadView(() => {
			this.albumListView.delegateEvents();
		}, () => {
			this.collection.albums.fetch();
		});
	},
	showAlbumView: function (shortName) {
		this.loadView(() => {
			this.albumView.initializeDropzone();
			this.albumView.initializeZeroClipboard();
			this.albumView.updateCopyLink();
		}, () => {
			this.model.album.set('shortName', shortName);
			this.model.album.fetch();
		});
	},
	showImageView: function (albumShortName, imageShortName) {
		this.loadView(() => {
		}, () => {
			var fileModel;
			if (this.model.album) {
				fileModel = this.model.album.getFileWithShortname(imageShortName);
			}
			this.imageView = new ImageView({
				el: this.$('#page-container')[0],
				model: {
					album: this.model.album,
					file: fileModel
				}
			});
			this.imageView.render();
		});
	},
	showHomepageView: function () {
		this.loadView(() => {
			this.homepageView.initializeDropzone();
		}, () => {
			this.homepageView.render();
		}, () => {
			this.homepageView.delegateEvents();
		});
	},
	/* DOM MANIPULATION */
	highlightShortLink: function (e) {
		e.preventDefault();
		let target = $(e.currentTarget);
		target.select();
	},
	openSignInModal: function (e) {
		e.preventDefault();
		e.stopPropagation();
		let SignInModalView = ModalViewWrapper(SignInView);
		let modalView = new SignInModalView();
		modalView.render().showModal();
		this.listenTo(modalView, 'signedIn', function () {
			this.showNotification({
				type: 'success',
				message: 'Congrats on signing up!'
			});
			modalView.hideModal();
		});
	},
	openSignUpModal: function (e) {
		e.preventDefault();
		e.stopPropagation();
		let SignUpModalView = ModalViewWrapper(SignUpView);
		let modalView = new SignUpModalView();
		modalView.render().showModal();
		this.listenTo(modalView, 'signedIn', function () {
			this.showNotification({
				type: 'success',
				message: 'Congrats on signing up!'
			});
			modalView.hideModal();
		});
	},
	preventEditing: function (e) {
		e.preventDefault();
	},
	/**
	 * Execute a different callback depending on whether this is the first load
	 * of the page or not. If it is, it'll do the first thing then set the
	 * firstLoad state to false. Otherwise it'll do the other function.
	 * @param  {[type]} firstCallback     [description]
	 * @param  {[type]} otherwiseCallback [description]
	 * @return {[type]}                   [description]
	 */
	loadView: function (firstCallback = () => {}, otherwiseCallback = () => {}, alwaysAfterCallback = () => {}) {
		let isFirstLoad = this.viewState.get('firstLoad');
		if (isFirstLoad) {
			firstCallback();
		} else {
			otherwiseCallback();
		}
		alwaysAfterCallback();
		this.viewState.set('firstLoad', false);
	}
});

export default ContainerView;
