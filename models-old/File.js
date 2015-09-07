var mongoose = require('mongoose');
var fileSchema = require('./schema/FileSchema');
var File = mongoose.model('File', fileSchema);

module.exports = File;