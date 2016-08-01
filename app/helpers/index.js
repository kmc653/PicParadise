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

// Find a single user based on a key
var findOne = function (body) {
    return new Promise(function (resolve, reject) {
        db.userModel.findOne({
            'email': body.email
        }, function (error, user) {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
};

var findOneBoard = function (body, currentUserId) {
    return new Promise(function (resolve, reject) {
        db.userModel.find({
            '_id': currentUserId,
            'boards.title' : body.boardName
        }, function (err, user) {
            if (err) { 
                reject(err);
            } else {
                resolve(user);
            }
        });
        // db.boardModel.findOne({
        //     'boardName': body.boardName,
        //     'userId': currentUserId
        // }, function (error, board) {
        //     if (error) {
        //         reject(error);
        //     } else {
        //         resolve(board);
        //     }
        // });
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
        // db.userModel.findById(currentUserId, function (err, user) {
        //     if (err) reject(err);

        //     user.boards = body.boardName;
        //     user.save(function (err) {
        //         if (err) reject(err);
        //     });
        //     resolve(user);
        // });
        db.userModel.findByIdAndUpdate(currentUserId, {
            $push: {
                "boards": { title: body.boardName.toLowerCase() }
            }
        }, {new: true}, function (err, user) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });

        // var newBoard = db.boardModel({
        //             boardName: body.boardName.toLowerCase(),
        //             userId: currentUserId
        // });
        // newBoard.save(function (error) {
        //     if(error) {
        //         reject(error);
        //     } else {
        //         resolve(newBoard);
        //     }
        // });
    });
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

// // A middleware that checks to see if the user is authenticated & logged in
// var isAuthenticated = function (req, res, next) {
//     if (req.isAuthenticated()) {
//         next();
//     } else {
//         res.redirect('/login');
//     }
// };

module.exports = {
    // route,
    findOne,
    createNewUser,
    findById,
    findOneBoard,
    createNewBoard
    // isAuthenticated
}