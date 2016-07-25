var mongoose = require('mongoose');

var pintableSchema = new mongoose.Schema({
    picId: {type: String, required: true },
    userId: {type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = pintableSchema;