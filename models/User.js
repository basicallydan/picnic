var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: String
});

userSchema.statics.findByEmail = function (email, cb) {
    this.findOne({ email: new RegExp(email, 'i') }, cb);
};

var User = mongoose.model('User', userSchema);

module.exports = User;