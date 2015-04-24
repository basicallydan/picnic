var SignUpView = Backbone.View.extend({
	signUpTemplate: require('../../../../views/signUp.handlebars'),
	events: {
		'submit #signUpForm': 'handleSubmit'
	},
	render: function () {
		let signUpRendered = this.signUpTemplate();
		this.$el.html(signUpRendered);
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
			this.trigger('signedUp', response);
			this.trigger('signedIn', response);
		}).fail(function(response) {
			this.trigger('signUpFailed', response);
		});
	}
});

export default SignUpView;