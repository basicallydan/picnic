// Based on http://mherman.org/blog/2013/11/11/user-authentication-with-passport-dot-js/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var _ = require('underscore');

var userSchema = new Schema({
    email: String,
    username: String,
    password: String,
    privacy: {
        type: Object,
        default: {
            imagesOwnershipOptIn: true
        }
    }
});

userSchema.methods.viewModel = function (override) {
    var viewModel = {
        links: {
            self: '/api/users/' + this.id,
            password: '/api/users/' + this.id + '/password',
            web: '/u/' + this.id
        },
        email: this.email
    };

    viewModel = _.extend(viewModel, override || {});

    return viewModel;
};

/**
 * Finds all the albums for the given ownershipCode and assigns them
 * to the user
 */
userSchema.methods.takeOwnershipOfAlbums = function (ownershipCode, cb) {
    var Album = mongoose.model('Album');
    var user = this;
    Album.findByOwnershipCode(ownershipCode, function(err, albums) {
        albums.forEach(function(album) {
            console.log('Transfering ownership of', album.id, 'to', user.email);
            album.transferOwnership(user, ownershipCode);
            album.save();
        });
        cb(null, albums);
    });
};

userSchema.plugin(passportLocalMongoose);

userSchema.statics.findByEmail = function (email, cb) {
    this.findOne({ email: new RegExp(email, 'i') }, cb);
};

var User = mongoose.model('User', userSchema);

module.exports = User;
