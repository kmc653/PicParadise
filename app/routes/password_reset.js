'use strict';

var _ = require('underscore');
var h = require('../helpers');

module.exports = function (express, app) {
    var passwordRouter = express.Router();

    passwordRouter.get('/password/reset_password/:token', function (req, res) {
        var token = req.params.token;
        res.render('password_resets/resetPassword', { token: token });
    });

    passwordRouter.post('/password/reset_password', function (req, res) {
        var body = _.pick(req.body, 'password', 'token');

        h.findByToken(body.token)
            .then(function (user) {
                if(user !== undefined && user !== null) {
                    user.password = body.password;
                    user.save(function (err) {
                        if(err) {
                            throw new Error(err);
                        }
                        req.session.user = user;
                        req.flash('success', "Password has been modified successfully!");
                        res.redirect('/');
                    });
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    app.use('/', passwordRouter);
}