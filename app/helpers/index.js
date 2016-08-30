'use strict';
var router = require('express').Router();
var db = require('../db');

// Find all users
var findAllUsers = function () {
    return new Promise(function (resolve, reject) {
        db.userModel.find({}, function (err, users) {
            if(err) {
                reject(err);
            } else {
                resolve(users);
            }
        })
    });
}

// Find a single user based on a key
var findOne = function (email) {
    return new Promise(function (resolve, reject) {
        db.userModel.findOne({
            'email': email
        }, function (error, user) {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
};

var findOneBoard = function (boardTitle, currentUserId) {
    return new Promise(function (resolve, reject) {
        db.boardModel.findOne({
            'title': boardTitle,
            '_creator': currentUserId
        }, function (error, board) {
            if (error) {
                reject(error);
            } else {
                resolve(board);
            }
        });
    });
}

var createNewUser = function (body) {
    return new Promise(function (resolve, reject) {
        var newUser = new db.userModel({
            email: body.email,
            username: body.username,
            password: body.password
        });
        newUser.save(function (error) {
            if(error) {
                reject(error);
            } else {
                resolve(newUser);
            }
        });
    });
}

var createNewBoard = function (body, currentUserId) {
    return new Promise(function (resolve, reject) {
        var boardTitle = body.boardName.toLowerCase();
        var photoFilename = body.photoFilenameinCreateBoardModal;
        
        var newBoard = new db.boardModel({
            title: boardTitle,
            _creator: currentUserId,
        });

        var saveNewBoard = function (board) {
            board.save(function (err) {
                if(err) {
                    reject(err);
                } else {
                    findById(currentUserId).then(function (user) {
                        user.boards.push(board);
                        user.save(function (err) {
                            if(err) {
                                reject(err);
                            } else {
                                resolve(user);
                            }
                        })
                    })
                }
            });
        }

        if(photoFilename.length !== 0) {
            db.picModel.findOne({ filename: photoFilename }, function (err, picture) {
                if(err) {
                    reject(err);
                } else {
                    newBoard.pins.push(picture);
                    saveNewBoard(newBoard);
                }
            });
        } else {
            saveNewBoard(newBoard)
        }
    });
}

var editBoard = function (body) {
    return new Promise(function (resolve, reject) {
        db.boardModel.findOne({ _id: body.boardIdinEditModal }, function (err, board) {
            if(err) {
                reject(err);
            } else {
                board.title = body.boardTitleinEditModal;

                board.save(function (err) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(board);
                    }
                });
            }
        });
    });
}

var deleteBoard = function (boardId, currentUserId) {
    return new Promise(function (resolve, reject) {
        db.boardModel.remove({
            _id: boardId
        }, function (err) {
            if(err) {
                reject(err);
            } else {
                db.userModel.findByIdAndUpdate(currentUserId, {
                    $pull: {
                        "boards": boardId
                    }
                }, {new: true}, function (err, user) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                });
            }
        });
    });
}

var followBoard = function (boardId, currentUser, ownerId) {
    return new Promise(function (resolve, reject) {
        db.boardModel.findByIdAndUpdate(boardId, {
            $push: {
                "followers": currentUser
            }
        }, {new: true}, function (err, board) {
            if(err) {
                reject(err);
            } else {
                db.userModel.findByIdAndUpdate(currentUser._id, {
                    $push: {
                        "followingBoards": board
                    }
                }, {new: true}, function (err, user) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                });
            }
        });
    });
}

var unfollowBoard = function (boardId, currentUser, ownerId) {
    return new Promise(function (resolve, reject) {
        db.boardModel.findByIdAndUpdate(boardId, {
            $pull: {
                "followers": currentUser._id
            }
        }, {new: true}, function (err, board) {
            if(err) {
                reject(err);
            } else {
                db.userModel.findByIdAndUpdate(currentUser._id, {
                    $pull: {
                        "followingBoards": board._id
                    }
                }, {new: true}, function (err, user) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                });
            }
        });
    });
}

var followUser = function (userId, currentUser) {
    return new Promise(function (resolve, reject) {
        db.userModel.findByIdAndUpdate(userId, {
            $push: {
                followers: currentUser
            }
        }, {new: true}, function (err, user) {
            if(err) {
                reject(err);
            } else {
                db.userModel.findByIdAndUpdate(currentUser._id, {
                    $push: {
                        followingUsers: user
                    }
                }, {new: true}, function (err, newCurrentUser) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(newCurrentUser);
                    }
                });
            }
        });
    });
}

var unfollowUser = function (userId, currentUser) {
    return new Promise(function (resolve, reject) {
        db.userModel.findByIdAndUpdate(userId, {
            $pull: {
                followers: currentUser._id
            }
        }, {new: true}, function (err, user) {
            if(err) {
                reject(err);
            } else {
                db.userModel.findByIdAndUpdate(currentUser._id, {
                    $pull: {
                        followingUsers: user._id
                    }
                }, {new: true}, function (err, newCurrentUser) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(newCurrentUser);
                    }
                });
            }
        });
    });
}

var editPin = function (boardId, photoFilename, user) {
    var newUser = deletePin(photoFilename, user);

    newUser.boards.forEach(function (board) {
        if(board.id === boardId) {
            board.pins.push(photoFilename);
        }
    });

    return newUser;
}

var deletePin = function (photoFilename, user) {
    user.boards.forEach(function (board) {
        var index = board.pins.indexOf(photoFilename);

        if(index !== -1) {
            var remove = board.pins.splice(index, 1);
            console.log(remove);
        }
    });
    return user;
}

var findById = function (id) {
    return new Promise(function(resolve, reject) {
        db.userModel.findById(id, function (error, user) {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
}

var findByUsername = function (username) {
    return new Promise(function (resolve, reject) {
        db.userModel.findOne({ username: username })
            .populate({
                path: 'followingBoards',
                populate: {
                    path: '_creator',
                    select: 'username'
                }
            })
            .populate({
                path: 'boards',
                populate: {
                    path: 'pins'
                }
            })
            .populate({
                path: 'followingBoards',
                populate: {
                    path: 'pins'
                }
            })
            .populate('followers')
            .populate('followingUsers')
            .exec(function (error, user) {
                if(error) {
                    reject(error);
                } else {
                    resolve(user);
                }
            });
    });
}

var findByToken = function (token) {
    return new Promise(function (resolve, reject) {
        db.userModel.findOne({ token: token }, function (err, user) {
            if(err) {
                reject(err);
            }
            resolve(user);
        });
    });
}

var findOwnerByBoardId = function (boardId) {
    return new Promise(function (resolve, reject) {
        db.userModel.findOne({ "boards._id": boardId }, function (error, user) {
            if(error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
}

var checkIfPin = function (filename, userId) {
    return new Promise(function (resolve, reject) {
        db.picModel.findOne({ filename: filename }, function (err, picture) {
            if(err) {
                reject(err);
            } else {
                db.boardModel.findOne({
                    _creator: userId,
                    pins: picture._id
                }, function (err, board) {
                    if(err) {
                        reject(err);
                    } else if(board) {
                        reject("You have already save this picture...");
                    } else {
                        resolve(picture);
                    }
                });
            }
        });
    });
}

var generateFilename = function (filename) {
    var ext_regex = /(?:\.([^.]+))?$/;
    var ext = ext_regex.exec(filename)[1];
    var date = new Date().getTime();
    var charBank = "ascdefghijklmnopqrstuvwxyz";
    var fstring = '';

    for(var i = 0; i < 15; i++) {
        fstring += charBank[parseInt(Math.random()*26)];
    }
    return (fstring += date + '.' + ext);
}

module.exports = {
    findAllUsers,
    findOne,
    createNewUser,
    findById,
    findByUsername,
    findByToken,
    findOwnerByBoardId,
    findOneBoard,
    createNewBoard,
    deleteBoard,
    followBoard,
    unfollowBoard,
    followUser,
    unfollowUser,
    editBoard,
    checkIfPin,
    deletePin,
    editPin,
    generateFilename
}