'use strict';

var passport = require('passport');
var config = require('../config');
var h = require('../helpers');
var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function () {
    
    // Saved to session req.session.passport.user = {id:'..'}
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // User object attaches to the request as req.user
    passport.deserializeUser(function (id, done) {
        h.findById(id).then(function (user) {
            done(null, user);
        }).catch(function (error) {
            console.log('Error when deserializing the user');
        });
    });

    var authProcessor = function (accessToken, refreshToken, profile, done) {
        // Find a user in the local db using profile.id
        // If the user is found, return the user data using the done()
        // Id the user is not found, create one in the local db and return
        h.findOne(profile.id)
            .then(function (result) {
                if (result) {
                    done(null, result);
                } else {
                    h.createNewfbUser(profile)
                        .then(function (newPhotoUser) {
                            done(null, newPhotoUser);
                        })
                        .catch(function (error) {
                            console.log('Error when creating new user.');
                        })
                }
            });
    };
    passport.use(new FacebookStrategy(config.fb, authProcessor));
};