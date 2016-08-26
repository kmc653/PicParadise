'use strict';
var router = require('express').Router();
var db = require('../db');

// Iterate through the routes object and mount the routes
// var _registerRoutes = function (routes, method) {
//     for(var key in routes) {
//         if(typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
//             _registerRoutes(routes[key], key);
//         } else {
//             // Register the routes
//             if(method === 'get') {
//                 router.get(key, routes[key]);
//             } else if(method === 'post') {
//                 router.post(key, routes[key]);
//             } else {
//                 router.use(routes[key]);
//             }
//         }
//     }
// }

// var route = function (routes) {
//     _registerRoutes(routes);
//     return router;
// }

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
        // db.userModel.find({
        //     '_id': currentUserId,
        //     'boards.title' : boardTitle
        // }, function (err, user) {
        //     if (err) { 
        //         reject(err);
        //     } else {
        //         resolve(user);
        //     }
        // });
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

// var createNewfbUser = function (profile) {
//     return new Promise(function(resolve, reject) {
//         var newPhotoUser = new db.fbUserModel({
//             profileId: profile.id,
//             fullName: profile.displayName,
//             profilePic: profile.photos[0].value || ''
//         });

//         newPhotoUser.save(function (error) {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(newPhotoUser);
//             }
//         });
//     })
// }
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
        // db.userModel.findByIdAndUpdate(currentUserId, {
        //     $pull: {
        //         "boards": { title: boardtitle.toLowerCase() }
        //     }
        // }, {new: true}, function (err, user) {
        //     if (err) {
        //         reject(err);
        //     } else {
        //         resolve(user);
        //     }
        // });
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
                })
                // db.userModel.findById(currentUserId, function (err, user) {
                //     if(err) {
                //         reject(err);
                //     } else {
                //         user.followingBoards.push(board);
                //         board.followers.push(user);

                //         board.save(function (err) {
                //             if(err) reject(err);
                //         });

                //         user.save(function (err) {
                //             if(err) {
                //                 reject(err);
                //             } else {
                //                 resolve(user);
                //             }
                //         });
                //     }
                // });
            }
        });
        // findById(ownerId).then(function (owner) {
        //     owner.boards.forEach(function (board) {
        //         if(board.id === boardId) {
        //             db.userModel.findByIdAndUpdate(currentUserId, {
        //                 $push: {
        //                     "followingBoards": board
        //                 }
        //             }, {new: true}, function (err, user) {
        //                 if (err) {
        //                     reject(err);
        //                 } else {
                            
        //                     // findById(ownerId).then(function (owner) {
        //                     //     owner.boards.forEach(function (board) {
        //                     //         if(board.id === boardId) {
        //                     //             board.followers.push(currentUserId);
        //                     //             owner.save(function (err) {
        //                     //                 if(err) {
        //                     //                     throw new Error(err);
        //                     //                 } else {
        //                     //                     resolve(user);
        //                     //                 }
        //                     //             })
        //                     //         }
        //                     //     })
        //                     // }).catch(function (error) {
        //                     //     reject(error);
        //                     // });
        //                 }
        //             });
        //         }
        //     })
        // })
        
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
        // db.userModel.findByIdAndUpdate(currentUserId, {
        //     $pull: {
        //         "followingBoards": boardId
        //     }
        // }, {new: true}, function (err, user) {
        //     if(err) {
        //         reject(err);
        //     } else {
        //         findById(ownerId).then(function (owner) {
        //             owner.boards.forEach(function (board) {
        //                 if(board.id === boardId) {
        //                     var index = board.followers.indexOf(currentUserId);

        //                     if(index !== -1) {
        //                         var remove = board.followers.splice(index, 1);
        //                         console.log(remove);
        //                         owner.save(function (err) {
        //                             if(err) {
        //                                 throw new Error();
        //                             } else {
        //                                 resolve(user);
        //                             }
        //                         })
        //                     }
        //                 }
        //             });
        //         }).catch(function (error) {
        //             reject(error);
        //         });
        //     }
        // });
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
            .exec(function (error, user) {
                if(error) {
                    reject(error);
                } else {
                    resolve(user);
                }
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
    // route,
    findAllUsers,
    findOne,
    createNewUser,
    findById,
    findByUsername,
    findOwnerByBoardId,
    findOneBoard,
    createNewBoard,
    deleteBoard,
    followBoard,
    unfollowBoard,
    editBoard,
    checkIfPin,
    deletePin,
    editPin,
    generateFilename
}