import SignUpView from './SignUpView';
import NewAlbumDropzoneMixin from './mixins/NewAlbumDropzoneMixin';

var AlbumListView = Backbone.View.extend({
	albumsTemplate: require('../../../../views/albums.handlebars'),
	className: 'album-list',
	events: {
		'submit #signUpForm': 'handleSubmit'
	},
	initialize: function () {
		this.viewState = new Backbone.Model();

		this.listenTo(this.collection.albums, 'sync', this.render);
		this.listenTo(this.collection.albums, 'sync', this.updateEmptyState);

		this.updateEmptyState();
	},
	initializeDropzone: NewAlbumDropzoneMixin.initializeDropzone,
	delegateEvents: function () {
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	render: function () {
		let user = this.model.user.toJSON();
		if (!user.email) {
			user = undefined;
		}
		let albumsRendered = this.albumsTemplate({
			user : user,
			albums : this.collection.albums.viewModel({ fileLimit : 6 })
		});
		this.$el.html(albumsRendered);
		return this;
	},
	updateEmptyState: function () {
		if (!this.collection.albums || !this.collection.albums.length) {
			this.$('.' + this.className).addClass('empty');
		} else {
			this.$('.' + this.className).removeClass('empty');
		}
	},
	handleSubmit: function (e) {
		e.preventDefault();
		var userPostData = $(e.currentTarget).serializeArray();
		userPostData[2] = {
			name: 'username',
			value: this.$('#signInEmail').val()
		};
		$.ajax('/api/users', {
			method: 'post',
			data: userPostData
		}).done(function(response) {
			Backbone.history.navigate('/a', { trigger : true });
		}).fail(function(response) {
			console.log('Failed to sign up user.');
		});
	}
});

export default AlbumListView;