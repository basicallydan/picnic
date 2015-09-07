var thinky = require('thinky')();
var type = thinky.type;
var _ = require('underscore');
var File;

// var passportLocalMongoose = require('passport-local-mongoose');

File = thinky.createModel('File', {
    id: type.string(),
    name: type.string(),
    shortName: type.string().default(function () {
        return shortId.generate();
    }),
    ownershipCode: type.string(),
    format: type.string(),
    createdAt: type.date().default(function () {
    	return new Date()
    }),
    width: type.number(),
    height: type.number(),
    cloudinary: type.object()
});

// File belongsto Album
// File belongsto User

module.exports = User;
