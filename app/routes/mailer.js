'use strict';

var _ = require('underscore');
var h = require('../helpers');
var mailers = require('../mailers');

module.exports = function (express, app) {
    var mailerRouter = express.Router();

    mailerRouter.get('/password/reset', function (req, res) {
        res.render('forgot_passwords/new');
    });

    mailerRouter.post('/password/reset', function (req, res) {
        var body = _.pick(req.body, 'email');
        var host = app.get('host');
        
        h.findOne(body.email)
            .then(function (user) {
                if(user !== undefined && user !== null) {
                    res.render('app_mailer/send_forgot_password', { 
                        host: host,
                        token: user.token
                    }, function (err, html) {
                        if(err) {
                            console.log(err);
                        } else {
                            mailers.sendPasswordResetEmail(body.email, html);
                        }
                    });
                    return res.render('forgot_passwords/confirm');
                } else {
                    req.flash('error', "We cannot find your account. Please sign up a new one.");
                    res.redirect('/password/reset');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    app.use('/', mailerRouter);
}