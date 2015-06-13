var passport = require('passport');
var _ = require('lodash');

var customPassportAuthenticate = function(options) {
	options = _.defaults(options, {
		required: true
	});
	return function (req, res, next) {
		var user = req.user;
		// passport.authenticate('local', function(err, user, info) {
		if (!user && options.required) {
			next({ status : 403, message : 'No user is signed in' });
		} else {
			next();
		}
		// })(req, res);
	};
};

module.exports = customPassportAuthenticate;