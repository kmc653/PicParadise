'use strict';

var _ = require('underscore');
var h = require('../helpers');
var db = require('../db');

module.exports = function (express, app) {
    var router = express.Router();

    // Create a board
    router.post('/board', function (req, res) {
        var body = _.pick(req.body, 'boardName');
        var currentUser = req.session.user;

        h.findOneBoard(body, currentUser._id)
            .then(function (result) {
                if (result.length !== 0) {
                    req.flash('error', "This board has already been created. Please try another one.");
                    res.render('index', {
                        user: currentUser,
                        host: app.get('host')
                    });
                } else {
                    h.createNewBoard(body, currentUser._id)
                        .then(function (result) {
                            console.log(result);
                            req.flash('success', "Board is created successfully!");
                            res.redirect('/');
                        })
                        .catch(function (error) {
                            res.send(error);
                        });
                }
            }).catch(function (error) {
                res.send(error);
            });
    });

    app.use('/', router);
};