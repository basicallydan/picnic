// Based on http://mherman.org/blog/2013/11/11/user-authentication-with-passport-dot-js/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var _ = require('underscore');

var userSchema = new Schema({
    email: String,
    password: String
});

userSchema.methods.viewModel = function (override) {
    var viewModel = {
        links: {
            self: '/api/user/' + this.id,
            web: 'http://localhost:3000/u/' + this.id
        },
        email: this.email
    };

    viewModel = _.extend(viewModel, override || {});

    return viewModel;
};

userSchema.plugin(passportLocalMongoose);

userSchema.statics.findByEmail = function (email, cb) {
    this.findOne({ email: new RegExp(email, 'i') }, cb);
};

var User = mongoose.model('User', userSchema);

module.exports = User;
