// import express from 'express';

// // Initialize http server
// const app = express();

// // Handle / route
// app.get('/', (req, res) =>
//   res.send('Hello World!')
// )

// // Launch the server on port 3000
// const server = app.listen(3000, () => {
//   const { address, port } = server.address();
//   console.log(`Listening at http://${address}:${port}`);
// });

var ticker = require('./ticker');

var express = require('express'),
  app = express(),
  port = 3000, //process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Task = require('./controller'), //created model loading here
  bodyParser = require('body-parser');
  
// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/xScraperDB'); 


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./routes'); //importing route
routes(app); //register the route

//start listening to incoming REST
const server = app.listen(port,() => {
	console.log('xscraper RESTful API server started on: ' + port);
});

//start xScraper ticker
ticker.execute();



