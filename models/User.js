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

module.exports = User;
