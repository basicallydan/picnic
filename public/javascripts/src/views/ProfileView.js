var ProfileView = Backbone.View.extend({
	// className:'image-view',
	profileTemplate: require('../../../../views/profile.handlebars'),
	events: {
		'submit #changePasswordForm': 'handlePasswordFormSubmit'
	},
	initialize: function() {
		// this.viewState = new Backbone.Model();
		this.listenTo(this.model.user, 'passwordChanged', function () {
			console.log('Password changed!');
		});
	},
	render: function() {
		let profileRendered = this.profileTemplate({
			file: this.model.user.toJSON()
		});
		this.$el.html(profileRendered);
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