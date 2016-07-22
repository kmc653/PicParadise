'use strict';

var config = require('../config');
var Mongoose = require('mongoose').connect(config.dbURI);
var userSchema = require('../models/user.js');
var picSchema = require('../models/picture.js');

// Log an error if the connection fails
Mongoose.connection.on('error', function (error) {
    console.log("MongoDB Error: ", error);
});

// // Create a Schema that defines the structure for storing user data
// var fbUser = new Mongoose.Schema({
//     profileId: String,
//     fullName: String,
//     profilePic: String
// });

// Turn the schema into a usable model
// var fbUserModel = Mongoose.model('fbUser', fbUser);
var userModel = Mongoose.model('user', userSchema);
var picModel = Mongoose.model('picture', picSchema);


module.exports = {
    Mongoose,
    // fbUserModel,
    userModel,
    picModel
}