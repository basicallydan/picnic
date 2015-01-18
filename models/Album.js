var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./User.js');
var shortId = require('shortid');

var albumSchema = new Schema({
    shortName: String,
    ownershipCode: {
        type : String,
        default : function () {
            return shortId.generate();
        } 
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

albumSchema.on('init', function (model) {
    console.log('Hahaha');
    if (!model.ownershipCode) {
        model.ownershipCode = 'awndkawd';
    }
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

var Album = mongoose.model('Album', albumSchema);

module.exports = Album;