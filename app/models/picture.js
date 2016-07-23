var mongoose = require('mongoose');

var picSchema = new mongoose.Schema({
    filename: String,
    votes: Number,
    userId: String 
});

module.exports = picSchema;