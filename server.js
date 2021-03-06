'use strict';

var PORT = process.env.PORT || 3000;
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var picParadise = require('./app');
var config = require('./app/config');
var knox = require('knox');
var fs = require('fs');
var os = require('os');
var formidable = require('formidable');
var flash = require('connect-flash');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('host', config.host);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(picParadise.session);
app.use(flash());
app.use(function (req, res, next) {
    var err = req.flash('error');
    res.locals.error = err.length ? err : null;

    var success = req.flash('success');
    res.locals.success = success.length ? success : null;

    next();
});

app.locals.h = require('./app/helpers');

var knoxClient = knox.createClient({
    key: config.S3AccessKey,
    secret: config.S3Secret,
    bucket: config.S3Bucket
});
// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());

// app.use(photoParadise.session);
// app.use(passport.initialize());
// app.use(passport.session());

// app.use('/', mainRoutes);
// app.use('/', userRoutes);

var server = require('http').createServer(app);
var io = require('socket.io')(server);

// app.use('/', photoParadise.router);
require('./app/db');
require('./app/routes/index.js')(express, app, formidable, fs, os, knoxClient, io);
require('./app/routes/board.js')(express, app);
require('./app/routes/user.js')(express, app);
require('./app/routes/pin.js')(express, app);
require('./app/routes/mailer.js')(express, app);
require('./app/routes/password_reset.js')(express, app);

server.listen(PORT, function () {
    console.log('PicParadise Running on PORT: ', PORT);
});