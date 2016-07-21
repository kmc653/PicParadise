'use strict';

var h = require('../helpers');
var _ = require('underscore');
var express = require('express');
var router = express.Router();
// var passport = require('passport');

    
router.get('/', function (req, res) {
    if (req.session.user) {
        res.render('index', {
            user: req.session.user
        });
    } else {
        res.redirect('login');
    }
});

router.get('/signup', function (req, res) {
    if(req.session.user) {
        res.redirect('/');
    }
    res.render('signup');
});

router.post('/signup', function (req, res) {
    var body = _.pick(req.body, 'email', 'username', 'password');

    h.findOne(body)
        .then(function (result) {
            if(result) {
                res.render('signup', {
                    flash: "This email has been used. Please try another one."
                });
            } else {
                h.createNewUser(body)
                    .then(function (user) {
                        req.session.user = user;
                        res.redirect('/');
                    })
                    .catch(function (error) {
                        console.log("Error when creating new user.");
                    });
            }
        });
});

router.get('/login', function (req, res) {
    if(req.session.user) {
        res.redirect('/');
    }
    res.render('login');
});

router.post('/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    console.log(body);

    h.findOne(body)
        .then(function (result) {
            if (result) {
                result.isValidPassword(body.password, function(err, isValid) {
                    if (err) {
                        throw err;
                    }
                    req.session.user = result;
                    res.redirect('/');
                });
            } else {
                res.render('login', {
                    flash: 'Cound not find this account'
                });
            }
        }).catch(function (error) {
            console.log('Error when loging');
        });
});

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

// router.get('/auth/facebook', passport.authenticate('facebook'));

// router.get('/auth/facebook/callback', passport.authenticate('facebook', {
//     successRedirect: '/home',
//     failureRedirect: '/login'
// }));



module.exports = router;
// var routes = {
//     'get': {
//         '/login': function (req, res, next) {
//             res.render('login');
//         },
//         '/home': [h.isAuthenticated, function (req, res, next) {
//             res.render('home', {
//                 user: req.user
//             });
//         }],
//         '/auth/facebook': passport.authenticate('facebook'),
//         '/auth/facebook/callback': passport.authenticate('facebook', {
//             successRedirect: '/home',
//             failureRedirect: '/'
//         }),
//         '/logout': function (req, res, next) {
//             req.logout();
//             res.redirect('/login');
//         }
//     },
//     'post': {

//     },
//     'NA': function (req, res, next) {
//         res.status(404).sendFile(process.cwd() + '/views/404.html');
//     }
// }

// return h.route(routes);