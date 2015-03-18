var passport = require('passport');
var _ = require('lodash');

var customPassportAuthenticate = function(options) {
	options = _.defaults(options, {
		required: true
	});
	return function (req, res, next) {
		var user = req.user;
		passport.authenticate('local', function(err, user, info) {
			console.log('User is', user);
			next();
		})(req, res);
	};
};

module.exports = customPassportAuthenticate;