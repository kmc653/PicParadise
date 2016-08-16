'use strict';

var h = require('../helpers');
var _ = require('underscore');

module.exports = function (express, app) {
    var pinRouter = express.Router();

    pinRouter.post('/editpin', function (req, res) {
        var body = _.pick(req.body, 'boardid', 'photoFilenameinEditModal');
        var currentUser = req.session.user;

        h.findById(currentUser._id).then(function (user) {
            if(user) {
                var newUser = h.editPin(body.boardid, body.photoFilenameinEditModal, user);
                newUser.save(function (err) {
                    if(err) throw new Error();

                    req.session.user = newUser;
                    req.flash('success', "Picture has been edited.");
                    res.redirect('back');
                });
            }else {
                req.flash('error', "You're not authorized to delete this pin.");
                res.redirect('back');
            }
        });
    });

    pinRouter.post('/deletepin', function (req, res) {
        var body = _.pick(req.body, 'photoFilenameinDeletePinModal');
        var currentUser = req.session.user;

        h.findById(currentUser._id).then(function (user) {
            if(user) {
                var newUser = h.deletePin(body.photoFilenameinDeletePinModal, user);
                newUser.save(function (err) {
                    if(err) throw new Error();

                    req.session.user = newUser;
                    req.flash('success', "Picture has been deleted!");
                    res.redirect('back');
                });
            } else {
                req.flash('error', "You're not authorized to delete this pin.");
                res.redirect('back');
            } 
        }).catch(function (error) {
            console.log('Error: ', error);
        })
    })


    app.use('/', pinRouter);
}