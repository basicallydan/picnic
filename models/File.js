var thinky = require('thinky')();
var type = thinky.type;
var _ = require('underscore');
var User = require('User');
var Album = require('Album');
var File;

// var passportLocalMongoose = require('passport-local-mongoose');

File = thinky.createModel('File', {
    id: type.string(),
    name: type.string(),
    shortName: type.string().default(function () {
        return shortId.generate();
    }),
    ownershipCode: type.string(),
    albumId: type.string(),
    ownerId: type.string().optional(),
    format: type.string(),
    createdAt: type.date().default(function () {
    	return new Date()
    }),
    width: type.number(),
    height: type.number(),
    cloudinary: type.object()
});

File.belongsTo(Album, 'album', 'albumId', 'id');
File.belongsTo(User, 'owner', 'ownerId', 'id');

module.exports = File;
