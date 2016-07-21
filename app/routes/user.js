// 'use strict';

// var h = require('../helpers');
// var _ = require('underscore');
// var express = require('express');
// var router = express.Router();

// router.post('/signup', function (req, res) {
//     var body = _.pick(req.body, 'email', 'username', 'password');

//     h.findOne(body)
//         .then(function (result) {
//             if(result) {
//                 res.render('signup', {
//                     flash: "This email has been used. Please try another one."
//                 });
//             } else {
//                 h.createNewUser(body)
//                     .then(function (user) {
//                         res.redirect('/home', {
//                             user: user
//                         });
//                     })
//                     .catch(function (error) {
//                         console.log("Error when creating new user.");
//                     })
//             }
//         });
// });

// module.exports = router;