var thinky = require('thinky')();
var type = thinky.type;
var shortId = require('shortid');
var _ = require('underscore');
var escapeRegexString = require('escape-regex-string');
var config = require('../config/config.js');
var url = require('url');
var Promise = require('bluebird');
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
    title: type.string().optional()
});

// Album belongsto user
// Album hasmany file

Album.ensureIndex('shortName');

module.exports = Album;
