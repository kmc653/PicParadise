var mongoose = require('mongoose');
var boardSchema = new mongoose.Schema({
    boardName: { type: String, required: true },
    userId: { type: String, required: true }
});

module.exports = boardSchema;