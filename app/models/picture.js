var mongoose = require('mongoose');

var picSchema = new mongoose.Schema({
    filename: String,
    votes: Number,
    userId: String,
    comments: [{ body: String, date: Date, userId: String }]
});

module.exports = picSchema;