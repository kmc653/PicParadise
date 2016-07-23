'use strict';

var h = require('../helpers');
var _ = require('underscore');
var gm = require('gm');
var db = require('../db');
// var express = require('express');

module.exports = function (express, app, formidable, fs, os, knoxClient, io) {
    var router = express.Router();
    var Socket;

    io.on('connection', function (socket) {
        Socket = socket;
    });
    // var passport = require('passport');

        
    router.get('/', function (req, res) {
        if (req.session.user) {
            res.render('index', {
                user: req.session.user,
                host: app.get('host')
            });
        } else {
            res.redirect('login');
        }
    });

    router.get('/signup', function (req, res) {
        if(req.session.user) {
            res.redirect('/');
        }
        res.render('signup');
    });

    router.post('/signup', function (req, res) {
        var body = _.pick(req.body, 'email', 'username', 'password');

        h.findOne(body)
            .then(function (result) {
                if(result) {
                    res.render('signup', {
                        flash: "This email has been used. Please try another one."
                    });
                } else {
                    h.createNewUser(body)
                        .then(function (user) {
                            req.session.user = user;
                            res.redirect('/');
                        })
                        .catch(function (error) {
                            console.log("Error when creating new user.");
                        });
                }
            });
    });

    router.get('/login', function (req, res) {
        if(req.session.user) {
            res.redirect('/');
        }
        res.render('login');
    });

    router.post('/login', function (req, res) {
        var body = _.pick(req.body, 'email', 'password');

        console.log(body);

        h.findOne(body)
            .then(function (result) {
                if (result) {
                    result.isValidPassword(body.password, function(err, isValid) {
                        if (err) {
                            throw err;
                        }
                        req.session.user = result;
                        res.redirect('/');
                    });
                } else {
                    res.render('login', {
                        flash: 'Cound not find this account'
                    });
                }
            }).catch(function (error) {
                console.log('Error when loging');
            });
    });

    router.get('/logout', function (req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    router.post('/upload', function (req, res) {
        
        var userid = req.session.user._id;

        function generateFilename (filename) {
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

        var tmpFile, nfile, fname;
        var newForm = new formidable.IncomingForm();
        newForm.keepExtensions = true;
        newForm.parse(req, function (err, fields, files) {
            tmpFile = files.upload.path;
            fname = generateFilename(files.upload.name);
            nfile = os.tmpDir() + '/' + fname;
            res.writeHead(200, {'Content-type':'text/plain'});
            res.end();
        });

        newForm.on('end', function () {
            fs.rename(tmpFile, nfile, function () {
                // Resize the image and upload this file into the S3 bucket
                gm(nfile).resize(300).write(nfile, function () {
                    // Upload file to the S3 bucket
                    fs.readFile(nfile, function (err, buf) {
                        var req = knoxClient.put(fname, {
                            'Content-Length': buf.length,
                            'Content-Type': 'image/jpeg'
                        });

                        req.on('response', function (res) {
                            if(res.statusCode == 200) {
                                var singleImage = db.picModel({
                                    filename: fname,
                                    votes: 0,
                                    userId: userid
                                }).save();

                                Socket.emit('status', {
                                    'msg': 'Save!!',
                                    'delay': 3000
                                });

                                Socket.emit('doUpdate', {});

                                fs.unlink(nfile, function () {
                                    console.log('Local file deleted!');
                                });
                            }
                        });
                        req.end(buf);
                    });
                });
            });
        })
    });

    router.get('/getimages', function (req, res) {
        db.picModel.find({}, null, {sort:{votes:-1}}, function (err, result) {
            res.send(JSON.stringify(result));
        });
    });

    router.get('/voteup/:id', function (req, res) {
        db.picModel.findByIdAndUpdate(req.params.id, {$inc:{votes:1}}, {new: true}, function (err, result) {
            res.send(JSON.stringify(result));
        });
    });

    app.use('/', router);
}



// router.get('/auth/facebook', passport.authenticate('facebook'));

// router.get('/auth/facebook/callback', passport.authenticate('facebook', {
//     successRedirect: '/home',
//     failureRedirect: '/login'
// }));



// module.exports = router;
// var routes = {
//     'get': {
//         '/login': function (req, res, next) {
//             res.render('login');
//         },
//         '/home': [h.isAuthenticated, function (req, res, next) {
//             res.render('home', {
//                 user: req.user
//             });
//         }],
//         '/auth/facebook': passport.authenticate('facebook'),
//         '/auth/facebook/callback': passport.authenticate('facebook', {
//             successRedirect: '/home',
//             failureRedirect: '/'
//         }),
//         '/logout': function (req, res, next) {
//             req.logout();
//             res.redirect('/login');
//         }
//     },
//     'post': {

//     },
//     'NA': function (req, res, next) {
//         res.status(404).sendFile(process.cwd() + '/views/404.html');
//     }
// }

// return h.route(routes);