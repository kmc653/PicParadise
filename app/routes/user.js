'use strict';

var h = require('../helpers');
var _ = require('underscore');
var db = require('../db');

module.exports = function (express, app) {
    var userRouter = express.Router();
    var boardRouter = express.Router({mergeParams: true});
    var pinRouter = express.Router({mergeParams: true});

    userRouter.use('/:username/boards', boardRouter);
    userRouter.use('/:username/pins', pinRouter);

    userRouter.post('/users', function (req, res) {
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

    userRouter.get('/:username', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else {
            try {
                db.userModel.findOne({ username: req.params.username }, function (err, user) {
                    if (err) throw new Error(err);
                    res.render('userboards', {
                        user: user,
                        host: app.get('host')
                    });
                });
            }
            catch (e) {
                res.send(e.name + ': ' + e.message);
            }
        }
    });

    // userRouter.get('/:username/:boardtitle', function (req, res) {
    //     if(!req.session.user) {
    //         res.redirect('/');
    //     } else {
    //         try {
    //             db.userModel.findOne({ username: req.params.username }, function (err, user) {
    //                 if (err) throw new Error(err);
                    
    //                 user.boards.forEach(function (board) {
    //                     if(board.title === req.params.boardtitle) {
                            
    //                         res.render('showboard', {
    //                             user: user,
    //                             board: board,
    //                             host: app.get('host')
    //                         });
    //                     }
    //                 });
    //             });
    //         }
    //         catch (e) {
    //             res.send(e.name + ': ' + e.message);
    //         }
    //     }
    // });

    boardRouter.get('/', function (req, res) {
        if(!req.session.user) {

        } else {
            try {
                db.userModel.findOne({ username: req.params.username }, function (err, user) {
                    if (err) throw new Error(err);
                    res.render('userboards', {
                        user: user,
                        host: app.get('host')
                    });
                });
            }
            catch (e) {
                res.send(e.name + ': ' + e.message);
            }
        }
    });

    boardRouter.get('/:boardtitle', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else {
            try {
                db.userModel.findOne({ username: req.params.username }, function (err, user) {
                    if (err) throw new Error(err);
                    
                    user.boards.forEach(function (board) {
                        if(board.title === req.params.boardtitle) {
                            
                            res.render('showboard', {
                                user: user,
                                board: board,
                                host: app.get('host')
                            });
                        }
                    });
                });
            }
            catch (e) {
                res.send(e.name + ': ' + e.message);
            }
        }
    });

    // pinRouter.get('/', function (req, res) {
    //     try {
    //         db.userModel.findOne({ username: req.params.username }, function (err, user) {
    //             if (err) throw new Error(err);
    //             res.render('userboards', {
    //                 user: user,
    //                 host: app.get('host')
    //             });
    //         });
    //     }
    //     catch (e) {
    //         res.send(e.name + ': ' + e.message);
    //     }
    // });

    app.use('/', userRouter);
}