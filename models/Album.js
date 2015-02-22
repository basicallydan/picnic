var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./User.js');
var shortId = require('shortid');
var _ = require('underscore');
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
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    files: [ Schema.Types.Mixed ]
});

albumSchema.methods.authorizeOwnershipCode = function (code) {
    return this.ownershipCode === code;
};

albumSchema.methods.transferOwnership = function (user, code) {
    if (this.authorizeOwnershipCode(code)) {
        this.owner = user;
    }
};

albumSchema.methods.ownedBy = function (user) {
    var owner;
    if (!this.owner._id) {
        owner = new User({ _id : this.owner });
    } else {
        owner = this.owner;
    }
    return user.equals(owner);
};

albumSchema.methods.viewModel = function (override) {
    var viewModel = {
        links: {
            self: '/api/albums/' + this.shortName,
            web: 'http://localhost:3000/a/' + this.shortName
        },
        shortName: this.shortName,
        ownershipCode: this.ownershipCode
    };
    var files = [];
    this.files.forEach(function (file) {
        files.push({
            size: file.size,
            mimeType: file.mimetype,
            originalName: file.originalname,
            links: {
                image: '/uploads/' + file.name
            }
        });
    });

    if (this.owner) {
        viewModel.owner = this.owner;
    }

    viewModel.files = files;

    viewModel = _.extend(viewModel, override || {});

    return viewModel;
};

albumSchema.statics.findByShortName = function (shortName, cb) {
    this.findOne({ shortName: new RegExp(shortName, 'i') }, cb);
};

albumSchema.statics.findByOwnershipCode = function (ownershipCode, cb) {
    this.find({ ownershipCode: new RegExp(ownershipCode, 'i') }, cb);
};

albumSchema.statics.findByOwner = function (user, cb) {
    this.find({ owner: user }, cb);
};

module.exports = mongoose.model('Album', albumSchema);