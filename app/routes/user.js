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

    userRouter.get('/users', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else {
            h.findAllUsers().then(function (users) {
                if(users) {
                    res.render('users', {
                        currentUser: req.session.user,
                        users: users
                    });
                } else {
                    res.render('users', {
                        currentUser: req.session.user
                    });
                }
            });
        }
    });

    userRouter.post('/users', function (req, res) {
        var body = _.pick(req.body, 'email', 'username', 'password');

        h.findOne(body.email)
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
                            console.log("Error when creating new user: ", error.message);
                        });
                }
            });
    });

    userRouter.get('/:username', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else if(req.params.username !== 'favicon.ico') {
            h.findByUsername(req.params.username)
                .then(function (user) {
                    if(user !== undefined && user !== null) {
                        res.render('userboards', {
                            currentUser: req.session.user,
                            user: user,
                            host: app.get('host')
                        });
                    }
                }).catch(function (error) {
                    console.log("Error when run users' boards: ", error);
                });
        }
    });

    userRouter.post('/followboard', function (req, res) {
        h.followBoard(req.body.boardId, req.session.user, req.body.ownerId)
            .then(function (user) {
                req.session.user = user;
                res.end();
            })
            .catch(function (error) {
                console.log("Error when follow board: ", error);
            });
    });

    userRouter.post('/unfollowboard', function (req, res) {
        h.unfollowBoard(req.body.boardId, req.session.user, req.body.ownerId)
            .then(function (user) {
                req.session.user = user;
                res.end();
            })
            .catch(function (error) {
                console.log("Error when unfollow board: ", error);
            });
    });

    userRouter.post('/followuser', function (req, res) {
        h.followUser(req.body.userId, req.session.user)
            .then(function (user) {
                req.session.user = user;
                res.end();
            })
            .catch(function (error) {
                console.log("Error when follow user: ", error);
            });
    });

    userRouter.post('/unfollowuser', function (req, res) {
        h.unfollowUser(req.body.userId, req.session.user)
            .then(function (user) {
                req.session.user = user;
                res.end();
            })
            .catch(function (error) {
                console.log("Error when unfollow user: ", error);
            });
    });

    userRouter.get('/:username/following', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else {
            h.findByUsername(req.params.username)
                .then(function (user) {
                    res.render('userfollowing', {
                        currentUser: req.session.user,
                        user: user,
                        host: app.get('host')
                    });
                })
                .catch(function (error) {
                    console.log("Error when run following board: ", error);
                });
        }
    });

    userRouter.get('/:username/followinguser', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else {
            h.findByUsername(req.params.username)
                .then(function (user) {
                    if(user !== undefined && user !== null) {
                        res.render('userfollowingUsers', {
                            currentUser: req.session.user,
                            user: user,
                            host: app.get('host')
                        });
                    }
                }).catch(function (error) {
                    console.log("Error when run following users: ", error);
                });
        }
    });

    userRouter.get('/:username/followers', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else {
            h.findByUsername(req.params.username)
                .then(function (user) {
                    res.render('userfollowers', {
                        currentUser: req.session.user,
                        user: user,
                        host: app.get('host')
                    });
                })
                .catch(function (error) {
                    console.log("Error when run followers: ", error);
                });
        }
    });

    boardRouter.get('/', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else if(req.params.username !== 'favicon.ico') {
            h.findByUsername(req.params.username)
                .then(function (user) {
                    if(user !== undefined && user !== null) {
                        res.render('userboards', {
                            currentUser: req.session.user,
                            user: user,
                            host: app.get('host')
                        });
                    }
                }).catch(function (error) {
                    console.log("Error when run users' boards: ", error);
                });
        }
    });

    boardRouter.get('/:boardtitle', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else {
            try {
                db.userModel.findOne({ username: req.params.username }).populate({
                    path: 'boards',
                    populate: { path: 'pins' }
                }).exec(function (err, user) {
                    if(err) {
                        throw new Error(err);
                    } else {
                        db.userModel.findOne({ _id: req.session.user._id }).populate('boards').exec(function (err, currentUser) {
                            if(err) {
                                throw new Error(err);
                            } else {
                                user.boards.forEach(function (board) {
                                    if(board.title === req.params.boardtitle) {
                                        res.render('showboard', {
                                            currentUser: currentUser,
                                            user: user,
                                            board: board,
                                            host: app.get('host')
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } catch (e) {
                res.send(e.name + ': ' + e.message);
            }
        }
    });

    pinRouter.get('/', function (req, res) {
        if(!req.session.user) {
            res.redirect('/');
        } else {
            try {
                db.userModel.findOne({ username: req.params.username }).populate({
                    path: 'boards',
                    populate: { path: 'pins' }
                }).exec(function (err, user) {
                    if(err) {
                        throw new Error(err);
                    } else {
                        db.userModel.findOne({ _id: req.session.user._id }).populate('boards').exec(function (err, currentUser) {
                            if(err) {
                                throw new Error(err);
                            } else {
                                res.render('userPins', {
                                    current: req.session.user,
                                    currentUser: currentUser,
                                    user: user,
                                    host: app.get('host')
                                });
                            }
                        });
                    }
                });
            }
            catch (e) {
                res.send(e.name + ': ' + e.message);
            }
        }
        
    });

    app.use('/', userRouter);
}