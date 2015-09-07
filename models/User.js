var thinky = require('thinky')();
var type = thinky.type;
var _ = require('underscore');
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

module.exports = User;
