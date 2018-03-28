var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//and create our instances
var app = express();
var router = express.Router();

//db config
mongoose.connect('mongodb://utest:123qwe@ds133296.mlab.com:33296/hamedtest');
var db = mongoose.connection;


//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

//now we should configure the API to use bodyParser and look for 
//JSON data in the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//now we can set the route path & initialize the API
router.get('/', function(req, res) {
    res.json({ message: 'API Initialized!'});
    console.log('API Initialized!');
   });

app.use('/', router);

// include routes
var routes = require('./models/user/index');
app.use('/user', routes);
var sroutes = require('./models/supplier/index');
app.use('/supplier', sroutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    console.log('inja'+req.url);
    err.status = 404;
    next(err);
  });
  
  // error handler
  // define as the last app.use callback
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
  });
  
  
  // listen on port 3000
  app.listen(3000, function () {
    console.log('Express app listening on port 3000');
  });