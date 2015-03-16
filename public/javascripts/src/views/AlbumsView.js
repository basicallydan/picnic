import Backbone from 'backbone';
import $ from 'jquery';
import SignUpView from './SignUpView';

var AlbumsView = Backbone.View.extend({
	albumsTemplate: require('../../../../views/albums.handlebars'),
	events: {
		'submit #signUpForm': 'handleSubmit'
	},
	initialize: function () {
		this.listenTo(this.collection.albums, 'sync', this.render);
	},
	delegateEvents: function () {
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	render: function () {
		let albumsRendered = this.albumsTemplate({
			albums : this.collection.albums.toJSON()
		});
		this.$el.html(albumsRendered);
		return this;
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

export default AlbumsView;