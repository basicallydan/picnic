var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./User.js');

var albumSchema = new Schema({
    shortName: String,
    ownershipCode: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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