var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./User.js');
var shortId = require('shortid');
var _ = require('underscore');
var escapeRegexString = require('escape-regex-string');
var config = require('../config/config.js');
var url = require('url');
var fileSchema = require('./schema/FileSchema');
var Album;

shortId.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

var albumSchema = new Schema({
    shortName: {
        type : String,
        default : function () {
            return shortId.generate();
        } 
    },
    ownershipCode: {
        type : String,
        default : function () {
            return shortId.generate();
        } 
    },
    status: Number,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    files: [ fileSchema ]
});

albumSchema.methods.authorizeOwnershipCode = function (code) {
    return this.ownershipCode === code;
};

albumSchema.methods.transferOwnership = function (user, code) {
    if (this.authorizeOwnershipCode(code)) {
        this.owner = user;
    	this.ownershipCode = undefined;
    }
    this.files.forEach(function (f) {
        if (!f.ownershipCode || f.authorizeOwnershipCode(code)) {
            f.owner = user;
            f.ownershipCode = undefined;
        }
    });
};

albumSchema.methods.ownedBy = function (user) {
    var owner;
    if (this.owner && !this.owner._id) {
        owner = new User({ _id : this.owner });
    } else {
        owner = this.owner;
    }
    return user.equals(owner);
};

albumSchema.methods.softDelete = function () {
    this.status = Album.statusCodes.deleted;
};

albumSchema.methods.isDeleted = function () {
    return this.status === Album.statusCodes.deleted;
};

albumSchema.methods.viewModel = function (override, options) {
    options = _.defaults(options || {}, {});
    var viewModel = {
        links: {
            self: '/api/albums/' + this.shortName,
            web: url.resolve(config.webHost, '/a/' + this.shortName)
        },
        shortName: this.shortName,
        deleted: false
    };

    if (options.user && this.ownedBy(options.user) && !this.isDeleted()) {
        viewModel.links.delete = '/api/albums/' + this.shortName;
    }

    if (this.ownershipCode) {
        viewModel.ownershipCode = this.ownershipCode;
    }

    if (options.canDelete) {
        viewModel.links.delete = '/api/albums/' + this.shortName;
    }

    if (this.status === Album.statusCodes.deleted) { 
        viewModel.deleted = true;
    } else {
        viewModel.links.files = '/api/albums/' + this.shortName + '/files/';
    }

    var files = [];
    this.files.forEach(_.bind(function (file, index) {
        files.push(file.viewModel(null, {
            user: options.user,
            album: this
        }));
    }, this));

    if (this.owner) {
        viewModel.owner = this.owner.viewModel();
    }

    viewModel.files = files;

    viewModel = _.extend(viewModel, override || {});

    return viewModel;
};

albumSchema.statics.findByShortName = function (shortName, cb) {
    this.findOne({ shortName: new RegExp(escapeRegexString(shortName), 'i') }).populate('owner').exec(cb);
};

albumSchema.statics.findByOwnershipCode = function (ownershipCode, cb) {
    this.find({ ownershipCode: new RegExp(escapeRegexString(ownershipCode), 'i') }).populate('owner').exec(cb);
};
albumSchema.statics.findByOwner = function (user, cb) {
    this.find({ owner: user }).populate('owner').exec(cb);
};

// Only finds non-deleted albums
albumSchema.statics.findActiveByOwnershipCode = function (ownershipCode, cb) {
    this.find({
        ownershipCode: new RegExp(escapeRegexString(ownershipCode), 'i'),
        status : { '$ne' : Album.statusCodes.deleted }
    }).populate('owner').exec(cb);
};

// Only finds non-deleted albums
albumSchema.statics.findActiveByOwner = function (user, cb) {
    this.find({
        owner: user,
        status : { '$ne' : Album.statusCodes.deleted }
    }).populate('owner').exec(cb);
};

albumSchema.statics.statusCodes = {
    active:0,
    deleted:1
};

Album = mongoose.model('Album', albumSchema);

module.exports = Album;
