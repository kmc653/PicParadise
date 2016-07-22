var mongoose = require('mongoose');

var picSchema = new mongoose.Schema({
    filename: String,
    votes: Number
});

module.exports = picSchema;