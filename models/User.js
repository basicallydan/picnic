var thinky = require('thinky')();
var type = thinky.type;
var _ = require('underscore');
var File = require('File');
var Album = require('Album');
var User;

// var passportLocalMongoose = require('passport-local-mongoose');

User = thinky.createModel('User', {
    id: type.string(),
    username: type.string().alphanum(),
    email: type.string().email(),
    password: type.string(),
    privacy: type.object().schema({
        imagesOwnershipOptIn: type.boolean().default(true)
    })
});

User.hasMany(Album, 'albums', 'id', 'ownerId');
User.hasMany(File, 'files', 'id', 'ownerId');

User.ensureIndex('email');

User.define('takeOwnershipOfAlbums', function (ownershipCode, cb) {
    var user = this;
    Album.findByOwnershipCode(ownershipCode, function(err, albums) {
        albums.forEach(function(album) {
            console.log('Transfering ownership of', album.id, 'to', user.email);
            album.transferOwnership(user, ownershipCode);
            album.save();
        });
        cb(null, albums);
    });
});

module.exports = User;
