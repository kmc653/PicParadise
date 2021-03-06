'use strict';

var _ = require('underscore');
var h = require('../helpers');
var db = require('../db');

module.exports = function (express, app) {
    var router = express.Router();

    // Create a board
    router.post('/board', function (req, res) {
        var body = _.pick(req.body, 'boardName', 'photoFilenameinCreateBoardModal');
        var currentUser = req.session.user;
        debugger;
        h.findOneBoard(body.boardName, currentUser._id)
            .then(function (result) {
                if (result) {
                    req.flash('error', "This board has already been created. Please try another one.");
                    res.redirect('back');
                } else {
                    h.createNewBoard(body, currentUser._id)
                        .then(function (result) {

                            req.session.user = result;
                            req.flash('success', "Board is created successfully!");
                            res.redirect('/' + currentUser.username);
                        })
                        .catch(function (error) {
                            res.send(error);
                        });
                }
            }).catch(function (error) {
                res.send(error.message);
            });
    });

    // Edit board title
    router.post('/editboardtitle', function (req, res) {
        var body = _.pick(req.body, 'boardTitleinEditModal', 'boardIdinEditModal');
        var currentUser = req.session.user;

        h.editBoard(body)
            .then(function(user) {
                // req.session.user = user;
                req.flash('success', "Board has been edited!");
                res.redirect('/' + currentUser.username);
            }).catch(function(error) {
                req.flash('error', error);
                res.redirect('/' + currentUser.username);
            });
    });

    // Delete board
    router.post('/deleteboard', function (req, res) {
        var body = _.pick(req.body, 'boardIdinDeleteBoardModel');
        var currentUser = req.session.user;

        h.deleteBoard(body.boardIdinDeleteBoardModel, currentUser._id)
            .then(function (result) {
                req.session.user = result;
                req.flash('success', "Board has been deleted!");
                res.redirect('/' + currentUser.username);
            }).catch(function (error) {
                req.flash('error', error.message);
                res.redirect('/' + currentUser.username);
            });
    });

    app.use('/', router);
};