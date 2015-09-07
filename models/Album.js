var thinky = require('thinky')();
var type = thinky.type;
var shortId = require('shortid');
var _ = require('underscore');
var escapeRegexString = require('escape-regex-string');
var config = require('../config/config.js');
var url = require('url');
var Promise = require('bluebird');
var User = require('User');
var File = require('File');
var Album;

shortId.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

Album = thinky.createModel('Album', {
    id: type.string(),
    shortName: type.string().default(function () {
        return shortId.generate();
    }),
    ownershipCode: type.string().default(function () {
        return shortId.generate();
    }),
    title: type.string().optional(),
    ownerId: type.string().optional()
});

Album.belongsTo(User, 'owner', 'ownerId', 'id');
Album.hasMany(File, 'files', 'id', 'albumId');

Album.ensureIndex('shortName');
Album.ensureIndex('ownershipCode');

Album.defineStatic('findByOwnershipCode', function (ownershipCode, cb) {
    Album.filter({ ownershipCode : ownershipCode })
        .getJoin({ owner : true, files : true })
        .then(cb);
});

module.exports = Album;
