var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./User.js');
var shortId = require('shortid');
var _ = require('underscore');
var cloudinary = require('cloudinary');
var escapeRegexString = require('escape-regex-string');
var config = require('../config/config.js');
var url = require('url');

cloudinary.config({
    cloud_name: 'dys2lsskw',
    api_key: '976447557551824',
    api_secret: 'vUHsdVarc_Wkye9nw9iPiQzF9cg'
});

shortId.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

var statusCodes = {
    active:0,
    deleted:1
};

var fileSchema = new Schema({
    name: String,
    bytes: Number,
    shortName: {
        type : String,
        default : function () {
            return shortId.generate();
        } 
    },
    ownershipCode: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    format: String,
    createdAt: Date,
    width: Number,
    height: Number,
    cloudinary: Schema.Types.Mixed
});

fileSchema.methods.authorizeOwnershipCode = function (code) {
    return this.ownershipCode === code;
};

fileSchema.methods.ownedBy = function (user) {
    var owner;
    if (!this.owner) {
        return false;
    }
    if (!this.owner._id) {
        owner = new User({ _id : this.owner });
    } else {
        owner = this.owner;
    }
    return user.equals(owner);
};

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
    this.status = statusCodes.deleted;
};

albumSchema.methods.isDeleted = function () {
    return this.status === statusCodes.deleted;
};

albumSchema.methods.viewModel = function (override, options) {
    options = _.defaults(options || {}, {});
    var viewModel = {
        links: {
            self: '/api/albums/' + this.shortName,
            files: '/api/albums/' + this.shortName + '/files/',
            web: url.resolve(config.webHost, '/a/' + this.shortName)
        },
        shortName: this.shortName
    };

    if (options.user && this.ownedBy(options.user)) {
        viewModel.links.delete = '/api/albums/' + this.shortName;
    }

    if (this.ownershipCode) {
        viewModel.ownershipCode = this.ownershipCode;
    }

    if (options.canDelete) {
        viewModel.links.delete = '/api/albums/' + this.shortName;
    }

    var files = [];
    this.files.forEach(_.bind(function (file, index) {
        files.push({
            shortName: file.shortName,
            bytes: file.bytes,
            width: file.width,
            height: file.height,
            links: {
                web: url.resolve(config.webHost, '/a/' + this.shortName + '/images/' + file.shortName),
                image: cloudinary.url(
                    file.cloudinary.id + '.' + file.format,
                    {
                        width: file.width,
                        height: file.height,
                        version: file.cloudinary.version
                    }
                ),
                imageW144: cloudinary.url(
                    file.cloudinary.id + '.' + file.format,
                    {
                        width: 144,
                        height: 144,
                        crop: 'fill',
                        version: file.cloudinary.version,
                        quality: 75
                    }
                ),
                imageW288: cloudinary.url(
                    file.cloudinary.id + '.' + file.format,
                    {
                        width: 288,
                        height: 288,
                        crop: 'fill',
                        version: file.cloudinary.version,
                        quality: 75
                    }
                ),
                imageW1136: cloudinary.url(
                    file.cloudinary.id + '.' + file.format,
                    {
                        width: 1136,
                        crop: 'scale',
                        version: file.cloudinary.version,
                        quality: 75
                    }
                )
            }
        });
    }, this));

    if (this.owner) {
        viewModel.owner = this.owner.viewModel();
    }

    viewModel.files = files;

    viewModel = _.extend(viewModel, override || {});

    return viewModel;
};

albumSchema.statics.findByShortName = function (shortName, cb) {
    this.findOne({ shortName: new RegExp(escapeRegexString(shortName), 'i') }, cb);
};

albumSchema.statics.findByOwnershipCode = function (ownershipCode, cb) {
    this.find({ ownershipCode: new RegExp(escapeRegexString(ownershipCode), 'i') }, cb);
};

albumSchema.statics.findByOwner = function (user, cb) {
    this.find({ owner: user }, cb);
};

module.exports = mongoose.model('Album', albumSchema);
