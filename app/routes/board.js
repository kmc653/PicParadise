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
                if (result.length !== 0) {
                    req.flash('error', "This board has already been created. Please try another one.");
                    res.redirect('/');
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
                res.send(error);
            });
    });

    // Edit board title
    router.post('/editboardtitle', function (req, res) {
        var body = _.pick(req.body, 'boardTitleinEditModal', 'boardIdinEditModal');
        var currentUser = req.session.user;

        h.editBoard(body, currentUser._id)
            .then(function(user) {
                req.session.user = user;
                req.flash('success', "Board has been edited!");
                res.redirect('/' + currentUser.username);
            }).catch(function(error) {
                req.flash('error', error);
                res.redirect('/' + currentUser.username);
            });
        // h.findById(currentUser._id)
        //     .then(function (user) {
        //         user.boards.forEach(function (board) {
        //             if(board._id === body.boardIdinEditModal) {
        //                 board.title = body.boardTitleinEditModal;
        //             }
        //         });
        //     }).catch(function (error) {
        //         req.flash('error', "You're not authorized to delete this board");
        //         res.redirect('/' + currentUser.username);
        //     });
    });

    // Delete board
    router.post('/deleteboard', function (req, res) {
        var body = _.pick(req.body, 'boardTitleinDeleteBoardModel');
        var currentUser = req.session.user;

        h.deleteBoard(body.boardTitleinDeleteBoardModel, currentUser._id)
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