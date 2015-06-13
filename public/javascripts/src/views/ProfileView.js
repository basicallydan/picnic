var ProfileView = Backbone.View.extend({
	// className:'image-view',
	profileTemplate: require('../../../../views/profile.handlebars'),
	events: {
		'submit #changePasswordForm': 'handlePasswordFormSubmit'
	},
	initialize: function() {
		this.viewState = new Backbone.Model();
		this.listenTo(this.model.user, 'passwordChanged', function () {
			this.viewState.set('passwordMessage', { type : 'success', message : 'Your password has been changed' });
		});
		this.listenTo(this.model.user, 'passwordChangeFailed', function () {
			this.viewState.set('passwordMessage', { type : 'error', message : 'Your password could not be changed' });
		});
		this.listenTo(this.viewState, 'change:passwordMessage', this.updatePasswordMessage);
	},
	render: function() {
		let profileRendered = this.profileTemplate({
			file: this.model.user.toJSON()
		});
		this.$el.html(profileRendered);
	},
	updatePasswordMessage: function () {
		var passwordMessage = this.viewState.get('passwordMessage');

		if (passwordMessage) {
			this.$('#passwordNotificationArea')
				.removeClass('error')
				.removeClass('success')
				.addClass(passwordMessage.type)
				.text(passwordMessage.message);
		} else {
			this.$('#passwordNotificationArea')
				.removeClass('error')
				.removeClass('success')
				.text('');
		}
	},
	handlePasswordFormSubmit: function (e) {
		e.preventDefault();
		var oldPassword = this.$('#oldPassword').val();
		var newPassword = this.$('#newPassword').val();
		var newPasswordRepeat = this.$('#newPasswordRepeat').val();
		if (newPassword !== newPasswordRepeat) {
			return;
		}
		this.model.user.changePassword(oldPassword, newPassword);
	}
});

export default ProfileView;