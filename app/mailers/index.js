'use strict';

var config = require('../config');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.gmail.user,
        pass: config.gmail.pass
    }
});

var sendPasswordResetEmail = function (email, html) {
    var options = {
        from: '"PicParadise" <info@picparadise.com>',
        to: email,
        subject: "Please reset your password on PicParadise",
        html: html
    }
    transporter.sendMail(options, function (err, info) {
        if(err) {
            console.log(err);
        } else {
            console.log(info.response);
        }
    });
};

module.exports = {
    sendPasswordResetEmail
}