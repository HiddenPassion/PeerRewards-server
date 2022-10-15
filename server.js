const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('morgan');

const config = require('./setting/config');
const router = require('./router');  

const app = express();

var options = { useNewUrlParser: true	};  
mongoose.connect(config.databaseURL, options);
mongoose.connection.on('open', () => console.log("Connected to  the database"))
mongoose.connection.on('error', console.error.bind(console, 'Connection error:'));  

app.use(logger('dev')); 
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  

app.use(function(req, res, next) {  
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS, PATCH');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

router(app); 
const server = app.listen(config.port, () => console.log(`Started on port ${config.port}`));

