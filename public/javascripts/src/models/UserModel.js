var UserModel = Backbone.Model.extend({
	url: function () {
		return this.get('links').self;
	},
	changePassword: function (oldPassword, newPassword) {
		var passwordURL = this.get('links').password;
		this.sync('update', this, {
			url: passwordURL,
			contentType: 'application/json',
			data: JSON.stringify({
				oldPassword: oldPassword,
				newPassword: newPassword
			}),
			success: function () {
				this.trigger('passwordChanged');
			}.bind(this),
			error: function () {
				this.trigger('passwordChangeFailed');
			}.bind(this)
		});
	}
});

module.exports = UserModel;