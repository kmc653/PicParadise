'use strict';

var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var photoParadise = require('./app');
var passport = require('passport');
var mainRoutes = require('./app/routes/index.js');
// var userRoutes = require('./app/routes/user.js');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());

app.use(photoParadise.session);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', mainRoutes);
// app.use('/', userRoutes);

// app.use('/', photoParadise.router);
// require('./app/routes/index.js')(express, app);
// require('./app/routes/user.js')(express, app);

app.listen(PORT, function () {
    console.log('PicParadise Running on PORT: ', PORT);
});