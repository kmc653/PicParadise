'use strict';

var config = require('../config');
var Mongoose = require('mongoose').connect(config.dbURI);
var userSchema = require('../models/user.js');
var picSchema = require('../models/picture.js');
var boardSchema = require('../models/board.js');

// Log an error if the connection fails
Mongoose.connection.on('error', function (error) {
    console.log("MongoDB Error: ", error);
});

// Turn the schema into a usable model
var userModel = Mongoose.model('user', userSchema);
var picModel = Mongoose.model('picture', picSchema);
var boardModel = Mongoose.model('board', boardSchema);


module.exports = {
    Mongoose,
    userModel,
    picModel,
    boardModel
}