#!/usr/bin/env node

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({path: '.env'});
const connect = require('./config/db');
// const {InfluxDB, Point} = require('@influxdata/influxdb-client');

// Create Express app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['*'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

connect.connectDB(); //connect mongodb
// Serve api rout
app.get('/', (_req, res) => {
  res.status(200).send('request ed home');
});

// Socket.io connection event
var nsp = io.of('/my_assets');

nsp.use((socket, next) => {
  console.log("executed beforeuse");
  console.log(socket.handshake.headers);
  next();
});
nsp.on('connection', function(socket){
  // console.log('someone connected');
  socket.emit('message', {description: 'Hay, welcome'});
  socket.join('newclientconnect');
  socket.send('connected');
  socket.emit('subscribe', 'newclientconnect');
  socket.emit('newclientconnect', {description: "client connected"});

  socket.on('disconnect', function(reason){
    console.log(reason);
    socket.emit('newclientconnect', {description: "client disconnected"});
  
  });

  socket.on('message', function(data){
    console.log(`recieved form message ${data}`);

    if (data == "getRecentData"){
      /**
       * TODO--------------
       * get sensor infomation from mongodb database
       * then get the query string of the sensor before
       * quering influx for data so that the user is restricted
       * to his sensor data only.
       */
      sensor_data_query_string = 'random_float'
      duration = '1h';

    }
  });

  socket.on('newclientconnect', (data)=>{
    // console.log(data)
    if (data == 'newclientconnect'){
      console.log('not allowed');
      return;
    }
    console.log(data);
  });

  setTimeout(function(){
    socket.emit('newclientconnect', function(){
      console.log('A user timedout');
      socket.disconnect();
    });
  }, 100000);

});


// Start server
server.listen(3000, () => console.log('listening on localhost:3000'));

// Export module for external use
module.exports = { app, server, io };
