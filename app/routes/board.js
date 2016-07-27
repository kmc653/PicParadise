'use strict';

var _ = require('underscore');
var h = require('../helpers');
var db = require('../db');

module.exports = function (express, app) {
    var router = express.Router();

    router.post('/board', function (req, res) {
        var body = _.pick(req.body, 'boardName');
        var currentUser = req.session.user;

        h.findOneBoard(body, currentUser._id)
            .then(function (result) {
                if (result) {
                    res.render('index', {
                        flash: "This board has been created. Please try another one.",
                        user: currentUser,
                        host: app.get('host')
                    });
                } else {
                    h.createNewBoard(body, currentUser._id)
                        .then(function (result) {
                            res.redirect('/');
                        })
                        .catch(function (error) {
                            res.send(error);
                        });
                }
            });
        // db.boardModel.findOne({ boardName: body.boardName.toLowerCase(), userId: currentUserId }, null, function(err, board) {
        //     if(board) {
        //         res.send("You've created the same board!");
        //     } else {
        //         var newBoard = db.boardModel({
        //             boardName: body.boardName.toLowerCase(),
        //             userId: currentUserId
        //         }).save();
        //         res.send('Create successfully!');
        //     }
        // });
    });

    app.use('/', router);
};