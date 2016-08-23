'use strict';

var h = require('../helpers');
var _ = require('underscore');
var db = require('../db');

module.exports = function (express, app) {
    var pinRouter = express.Router();

    pinRouter.post('/editpin', function (req, res) {
        var body = _.pick(req.body, 'boardid', 'photoFilenameinEditModal');
        var currentUser = req.session.user;

        try {
            db.picModel.findOne({ filename: body.photoFilenameinEditModal }, function (err, picture) {
                if(err) {
                    throw new Error(err);
                } else {
                    db.boardModel.findOneAndUpdate({ _creator: currentUser._id, pins: picture._id }, {
                        $pull: {
                            "pins": picture._id
                        }
                    }, {new: true}, function (err, board) {
                        if(err) {
                            throw new Error(err);
                        } else {
                            db.boardModel.findByIdAndUpdate(body.boardid, {
                                $push: {
                                    "pins": picture
                                }
                            }, {new: true}, function (err, board) {
                                if(err) {
                                    throw new Error(err);
                                } else {
                                    req.flash('success', "Picture has been edited.");
                                    res.redirect('back');
                                }
                            });
                        }
                    });
                }
            });

            // db.boardModel.findOne({ _id: body.boardid }).populate('pins').exec(function (err, board) {
            //     if(err) {
            //         throw new Error(err);
            //     } else {
            //         db.picModel.findOne({ filename: body.photoFilenameinEditModal }, function (err, picture) {
            //             if(err) {
            //                 throw new Error(err);
            //             } else {

            //             }
            //         });
            //     }
            // });
        }
        catch (e) {
            req.flash('error', e.message);
            res.redirect('back');
        }
        
        // h.findById(currentUser._id).then(function (user) {
        //     if(user) {
        //         var newUser = h.editPin(body.boardid, body.photoFilenameinEditModal, user);
        //         newUser.save(function (err) {
        //             if(err) throw new Error();

        //             req.session.user = newUser;
        //             req.flash('success', "Picture has been edited.");
        //             res.redirect('back');
        //         });
        //     }else {
        //         req.flash('error', "You're not authorized to delete this pin.");
        //         res.redirect('back');
        //     }
        // });
    });

    pinRouter.post('/deletepin', function (req, res) {
        var body = _.pick(req.body, 'photoFilenameinDeletePinModal');
        var currentUser = req.session.user;

        try {
            db.picModel.findOne({ filename: body.photoFilenameinDeletePinModal }, function (err, picture) {
                if(err) {
                    throw new Error(err);
                } else {
                    db.boardModel.findOneAndUpdate({
                        _creator: currentUser._id,
                        pins: picture._id
                    }, {
                        $pull: {
                            "pins": picture._id
                        }
                    }, {new: true}, function (err, board) {
                        if(err) {
                            throw new Error(err);
                        } else {
                            req.flash('success', "Picture has been deleted!");
                            res.redirect('back');
                        }
                    });
                }
            });
        }
        catch (e) {
            req.flash('error', e.message);
            res.redirect('back');
        }
        
        // h.findById(currentUser._id).then(function (user) {
        //     if(user) {
        //         var newUser = h.deletePin(body.photoFilenameinDeletePinModal, user);
        //         newUser.save(function (err) {
        //             if(err) throw new Error();

        //             req.session.user = newUser;
        //             req.flash('success', "Picture has been deleted!");
        //             res.redirect('back');
        //         });
        //     } else {
        //         req.flash('error', "You're not authorized to delete this pin.");
        //         res.redirect('back');
        //     } 
        // }).catch(function (error) {
        //     console.log('Error: ', error);
        // })
    })


    app.use('/', pinRouter);
}