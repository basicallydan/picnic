import Backbone from 'backbone';
import $ from 'jquery';

var SignInView = Backbone.View.extend({
	signInTemplate: require('../../../../views/signIn.handlebars'),
	events: {
		'submit #signInForm': 'handleSubmit'
	},
	render: function () {
		let signInRendered = this.signInTemplate();
		this.$el.html(signInRendered);
		return this;
	},
	handleSubmit: function (e) {
		e.preventDefault();
		var userPostData = $(e.currentTarget).serializeArray();
		userPostData[2] = {
			name: 'username',
			value: this.$('#signInEmail').val()
		};
		$.ajax('/api/users/authenticate', {
			method: 'post',
			data: userPostData
		}).done((response) => {
			this.trigger('signedIn', response);
		}).fail((response) => {
			this.trigger('signInFailed', response);
		});
	}
});

export default SignInView;