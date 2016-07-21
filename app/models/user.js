var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
    email: { type: String, required: true, index: { unique: true } },
    username: {type: String, required: true },
    password: { type: String, required: true }
});

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

module.exports = userSchema;