var passport = require('passport');

var customPassportAuthenticate = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			console.log('Error!', err);
			return next(err);
		}
		if (!user) {
			console.log('No user!');
			res.status(401);
			return res.send({
				message: 'Authenication failed'
			});
		}
		console.log('Logged in user', user);
		req.user = user;
		next();
	})(req, res, next);
};

module.exports = customPassportAuthenticate;