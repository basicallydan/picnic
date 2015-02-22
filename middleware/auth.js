var passport = require('passport');

var customPassportAuthenticate = function(options) {
	options = options || {
		required: true
	};
	return function (req, res, next) {
		console.log('Request cookies:', req.cookies);
		passport.authenticate('local', function(err, user, info) {
			if (err) {
				console.log('Error!', err);
				return next(err);
			}
			if (!user && options.required) {
				console.log('No user, user is required!');
				res.status(401);
				return res.send({
					message: 'Authenication failed'
				});
			}

			if (user) {
				console.log('Logged in user', user);
				req.user = user;
			} else {
				console.log('No user, oh well', user, 'info is', info);
			}

			next();
		})(req, res, next);
	};
};

module.exports = customPassportAuthenticate;