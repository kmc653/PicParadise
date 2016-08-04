'use strict';

var h = require('../helpers');
var _ = require('underscore');
var db = require('../db');

module.exports = function (express, app) {
    var router = express.Router();

    router.post('/users', function (req, res) {
        var body = _.pick(req.body, 'email', 'username', 'password');

        
        h.findOne(body)
            .then(function (result) {
                if(result) {
                    req.flash('error', "This email has been used. Please try another one.");
                    res.redirect('signup');
                } else {
                    h.createNewUser(body)
                        .then(function (user) {
                            req.session.user = user;
                            req.flash('success', "Sign up successfully!");
                            res.redirect('/');
                        })
                        .catch(function (error) {
                            console.log("Error when creating new user.");
                        });
                }
            });
    });

    app.use('/', router);  
}

