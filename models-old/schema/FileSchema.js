var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortId = require('shortid');
var url = require('url');
var User = require('../User.js');
var config = require('../../config/config.js');
var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'dys2lsskw',
    api_key: '976447557551824',
    api_secret: 'vUHsdVarc_Wkye9nw9iPiQzF9cg'
});

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

fileSchema.methods.viewModel = function (override, options) {
    var fileViewModel = {
        shortName: this.shortName,
        bytes: this.bytes,
        width: this.width,
        height: this.height,
        links: {
            self: '/api/files/' + this.shortName,
            web: url.resolve(config.webHost, '/a/' + options.album.shortName + '/images/' + this.shortName),
            image: cloudinary.url(
                this.cloudinary.id + '.' + this.format,
                {
                    width: this.width,
                    height: this.height,
                    version: this.cloudinary.version
                }
            ),
            imageW144: cloudinary.url(
                this.cloudinary.id + '.' + this.format,
                {
                    width: 144,
                    height: 144,
                    crop: 'fill',
                    version: this.cloudinary.version,
                    quality: 75
                }
            ),
            imageW288: cloudinary.url(
                this.cloudinary.id + '.' + this.format,
                {
                    width: 288,
                    height: 288,
                    crop: 'fill',
                    version: this.cloudinary.version,
                    quality: 75
                }
            ),
            imageW1136: cloudinary.url(
                this.cloudinary.id + '.' + this.format,
                {
                    width: 1136,
                    crop: 'scale',
                    version: this.cloudinary.version,
                    quality: 75
                }
            )
        }
    };

    if (this.ownedBy(options.user)) {
        fileViewModel.links.delete = '/api/files/' + this.shortName;
    }

    return fileViewModel;
};

module.exports = fileSchema;