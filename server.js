// Get the packages we need
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

// Create our Express application
var app = express();

// Use environment defined port or 3000
var port = process.env.PORT || 3000;  //port for server, not database!

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

// Use routes as a module (see index.js)
require('./routes')(app, router);

//connect to Mongodb
var mongoose = require('mongoose');
// mongoose.connect('mongodb://yihan:62524391@ds129153.mlab.com:29153/yihan_db');
mongoose.connect('mongodb://localhost/mp4');//will create database mp4 if not exist
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function(){
  console.log("mongoDB opened");
})

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
