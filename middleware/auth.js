var passport = require('passport');
var _ = require('lodash');

var customPassportAuthenticate = function(options) {
	options = _.defaults(options, {
		required: true
	});
	return function (req, res, next) {
		console.log('Request cookies:', req.cookies);
		var user = req.user;
		console.log('Request user is', req);
		passport.authenticate('local', function(err, user, info) {
			console.log('User is', user);
			next();
		})(req, res);
		// if (!user && options.required) {
		// 	console.log('No user! User is required!');
		// 	res.status(401);
		// 	return res.send({
		// 		message: 'Authentication failed'
		// 	});
		// }

		// if (user) {
		// 	console.log('Logged in user is', user.username);
		// } else {
		// 	console.log('No user, oh well.');
		// }

		// next();
	};
};

module.exports = customPassportAuthenticate;