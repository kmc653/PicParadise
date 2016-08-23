var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var boardSchema = Schema({
    title: { type: String, required: true },
    _creator: { type: Schema.Types.ObjectId, ref: 'user' },
    pins: [{ type: Schema.Types.ObjectId, ref: 'picture' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'user' }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = boardSchema;