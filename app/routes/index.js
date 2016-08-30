'use strict';

var h = require('../helpers');
var _ = require('underscore');
var gm = require('gm');
var db = require('../db');

module.exports = function (express, app, formidable, fs, os, knoxClient, io) {
    var router = express.Router();
    var Socket;

    io.on('connection', function (socket) {
        Socket = socket;
    });

        
    router.get('/', function (req, res) {
        if (req.session.user) {
            var currentUser = req.session.user;
            db.userModel.findOne({ _id: currentUser._id }).populate({
                path: 'boards',
                populate: { path: 'pins' }
            }).exec(function (err, user) {
                if(err) throw err;
                res.render('index', {
                    currentUser: user,
                    user: user,
                    host: app.get('host')
                });
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

    router.get('/login', function (req, res) {
        if(req.session.user) {
            res.redirect('/');
        }
        res.render('login');
    });

    router.post('/login', function (req, res) {
        var body = _.pick(req.body, 'email', 'password');

        console.log(body);

        h.findOne(body.email)
            .then(function (result) {
                if (result) {
                    result.isValidPassword(body.password, function(err, isValid) {
                        if (err) throw err;
                        
                        if(isValid) {
                            req.session.user = result;
                            req.flash('success', "Login successfully!");
                            res.redirect('/');
                        } else {
                            req.flash('error', "Password is wrong. Please try again.");
                            res.redirect('login');
                        }
                    });
                } else {
                    req.flash('error', "Could not find this account. Please sign up with your email address.");
                    res.redirect('login');
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
    });

    router.get('/logout', function (req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    router.post('/upload', function (req, res) {
        
        var currentUser = req.session.user;
        var tmpFile, nfile, fname;
        var newForm = new formidable.IncomingForm();
        newForm.keepExtensions = true;
        newForm.parse(req, function (err, fields, files) {
            tmpFile = files.upload.path;
            fname = h.generateFilename(files.upload.name);
            nfile = os.tmpDir() + '/' + fname;
            res.writeHead(200, {'Content-type':'text/plain'});
            res.end();
        });

        newForm.on('end', function () {
            fs.rename(tmpFile, nfile, function () {
                // Resize the image and upload this file into the S3 bucket
                gm(nfile).resize(400).autoOrient().write(nfile, function () {
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
                                    _creator: currentUser
                                }).save();

                                Socket.emit('doUpdate', {
                                    'filename': fname
                                });
                                
                                Socket.emit('status', {
                                    'msg': 'Save!!',
                                    'delay': 3000
                                });

                                fs.unlink(nfile, function () {
                                    console.log('Local file deleted!');
                                });
                            }
                        });
                        req.end(buf);
                    });
                });
            });
        });
    });

    router.post('/uploadprofilepic', function (req, res) {
        
        var currentUser = req.session.user;
        var tmpFile, nfile, fname;
        var newForm = new formidable.IncomingForm();
        newForm.keepExtensions = true;
        newForm.parse(req, function (err, fields, files) {
            tmpFile = files.upload.path;
            fname = h.generateFilename(files.upload.name);
            nfile = os.tmpDir() + '/' + fname;
            res.writeHead(200, {'Content-type':'text/plain'});
            res.end();
        });

        newForm.on('end', function () {
            fs.rename(tmpFile, nfile, function () {
                gm(nfile).resize(400).autoOrient().write(nfile, function () {
                    fs.readFile(nfile, function (err, buf) {
                        var req = knoxClient.put(fname, {
                            'Content-Length': buf.length,
                            'Content-Type': 'image/jpeg'
                        });

                        req.on('response', function (res) {
                            if(res.statusCode == 200) {
                                db.userModel.findByIdAndUpdate(currentUser._id, {
                                    profilePic: "https://d1uev2sppo24zv.cloudfront.net/" + fname
                                }, {new: true}, function (err, user) {
                                    if(err) {
                                        throw new Error("Failed to update profile picture.");
                                    } else {
                                        Socket.emit('status', {
                                            'msg': 'Completed!!',
                                            'delay': 3000
                                        });

                                        Socket.emit('reload');

                                        fs.unlink(nfile, function () {
                                            console.log('Local file deleted!');
                                        });
                                    } 
                                });
                            }
                        });
                        req.end(buf);
                    });
                });
            });
        });
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

    router.post('/savephoto', function (req, res) {
        var body = _.pick(req.body, 'boardid', 'photofilename');
        var currentUserId = req.session.user._id;

        h.checkIfPin(body.photofilename, currentUserId)
            .then(function (result) {
                db.boardModel.findOne({ _id: body.boardid }).populate('pins').exec(function (err, board) {
                    if(err) {
                        throw new Error(err);
                    } else {
                        board.pins.push(result);

                        board.save(function (err) {
                            if(err) { 
                                throw new Error(err);
                            } else {
                                req.flash('success', "Picture is saved successfully!");
                                res.redirect('back');
                            }
                        });
                    }
                });
            }).catch(function (error) {
                req.flash('error', error);
                res.redirect('back');
            });
    });

    app.use('/', router);
}