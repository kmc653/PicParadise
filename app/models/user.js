var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    _ = require('underscore');

var userSchema = Schema({
    email: { type: String, required: true, index: { unique: true } },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    boards: [{ type: Schema.Types.ObjectId, ref: 'board' }],
    pins: [{ type: Schema.Types.ObjectId, ref: 'picture' }],
    followingBoards:[{ type: Schema.Types.ObjectId, ref: 'board' }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// userSchema.path('email').validate(function (email) {
//    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
//    return emailRegex.test(email.text); // Assuming email has a text attribute
// }, 'The e-mail field cannot be empty.');

userSchema.pre('save', function (next) {
    var user = this;

    if(typeof user.email === 'string') {
        user.email = user.email.toLowerCase();
    }

    if(!user.isModified('password')) {
        return next();
    }

    bcrypt.hash(user.password, 12, function (err, hash) {
        if(err) {
            next(err);
            return;
        }
        user.password = hash;
        next();
    });
});


// Define a method to verify password validity (instance methods)
userSchema.methods.isValidPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (error, isValid) {
        if(error) {
            return callback(error);
        }
        callback(null, isValid);
    });
};

// userSchema.methods.generateToken = function (type) {
//     if(!_.isString(type)) {
//         return undefined;
//     }

//     try {
//         var stringData = JSON.stringify({id: this.get('id'), type: type});
//         var encryptedData = cryptojs.AES.encrypt()
//     }
// }

userSchema.methods.getPinsAmount = function () {
    var user = this;
    var amount = 0;

    user.boards.forEach(function (board) {
        amount += board.pins.length;
    });

    return amount;
};

module.exports = userSchema;