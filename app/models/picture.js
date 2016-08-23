var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var picSchema = Schema({
    filename: String,
    votes: Number,
    _creator: { type: Schema.Types.ObjectId, ref: 'user' },
    comments: [{ body: String, date: Date, userId: String }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = picSchema;