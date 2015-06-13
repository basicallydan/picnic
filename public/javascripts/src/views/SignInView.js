var SignInView = Backbone.View.extend({
	signInTemplate: require('../../../../views/signIn.handlebars'),
	events: {
		'submit #signInForm': 'handleSubmit'
	},
	initialize: function () {
		this.viewState = new Backbone.Model();

		this.listenTo(this.viewState, 'change:errorMessage', this.updateErrorMessage);
	},
	render: function () {
		let signInRendered = this.signInTemplate();
		this.$el.html(signInRendered);
		return this;
	},
	updateErrorMessage: function () {
		var errorMessage = this.viewState.get('errorMessage');

		if (errorMessage) {
			this.$('.inline-notification-area')
				.addClass('error')
				.text(errorMessage);
		} else {
			this.$('.inline-notification-area')
				.removeClass('error')
				.text('');
		}
	},
	handleSubmit: function (e) {
		e.preventDefault();
		var userPostData = $(e.currentTarget).serializeArray();
		userPostData[2] = {
			name: 'username',
			value: this.$('#signInEmail').val()
		};
		this.viewState.set('errorMessage', undefined);
		$.ajax('/api/users/authenticate', {
			method: 'post',
			data: userPostData
		}).done((response) => {
			this.viewState.set('errorMessage', undefined);
			this.trigger('signedIn', response);
		}).fail((response) => {
			this.viewState.set('errorMessage', 'Oops! Couldn\'t sign you in. Check your details and try again.');
			this.trigger('signInFailed', response);
		});
	}
});

export default SignInView;