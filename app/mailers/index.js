'use strict';

var config = require('../config');
var sg = require('sendgrid')(config.sgApiKey);

var sendPasswordResetEmail = function (email, html) {
    var helper = require('sendgrid').mail;
    var from_email = new helper.Email('info@picparadise.com');
    var to_email = new helper.Email(email);
    var subject = 'Please reset your password on PicParadise';
    var content = new helper.Content('text/html', html);
    var mail = new helper.Mail(from_email, subject, to_email, content);
    var request = sg.emptyRequest({
        method: "POST",
        path: "/v3/mail/send",
        body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
};

module.exports = {
    sendPasswordResetEmail
}