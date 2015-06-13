var passport = require('passport');
var _ = require('lodash');

var customPassportAuthenticate = function(options) {
	options = _.defaults(options, {
		required: true
	});
	return function (req, res, next) {
		if (req.user) {
			req.userViewModel = req.user.viewModel();
		}
		if (!req.user && options.required) {
			next({ statusCode : 403, message : 'No user is signed in' });
		} else {
			next();
		}
	};
};

module.exports = customPassportAuthenticate;