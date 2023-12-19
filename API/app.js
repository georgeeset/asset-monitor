#!/usr/bin/env node

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connect from './config/db.js';
import { InfluxDB } from '@influxdata/influxdb-client';
import { triggerAsyncId } from 'async_hooks';

import mqtt from 'mqtt';


dotenv.config({path: '.env'});
// Set your InfluxDB configuration
const influxUrl = process.env.INFLUX_URL;
const influxToken = process.env.INFLUX_TOKEN;
const influxOrg = process.env.INFLUX_ORG;

// Instantiate the InfluxDB client with the provided configuration
const influx = new InfluxDB({url: influxUrl, token: influxToken, org: influxOrg});
const queryApi = influx.getQueryApi(influxOrg);

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

const mqttOptions = {
  port: process.env.MQTT_PORT,
  host: process.env.MQTT_HOST,
  clientId: process.env.MQTT_CLIENT_ID,
  clean: true
};

const mqttClient = mqtt.connect(mqttOptions);
// connect.connectDB(); //connect mongodb
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
    mqttClient.disconnect();
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
      // const query = 'SELECT * FROM EsetAutomation WHERE time > now() - 6h';
      const fluxQuery = `from(bucket: "EsetAutomaiton")
      |> range(start: 0)
      |> filter(fn: (r) => r._measurement == "vibration")`;


      // Create an async function to query and log new data
      const myQuery = async () => {
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
          const o = tableMeta.toObject(values);
          console.log(`${o._time} ${o._measurement} in '${o.location}' (${o.sensor_id}): ${o._field}=${o._value}`);
        }
      };
      myQuery().then(()=>{

        // client.on('connect', ()=>{
        //   console.log('Connected to MQTT broker');
        //   client.subscribe('EsetAutomaiton/#');
        // });
        mqttClient.subscribe('EsetAutomaiton/#');

        mqttClient.on('message', (topic, message) => {
          console.log('new data received', topic);
          console.log(message.toString());
        });
        
        mqttClient.on('error', (error) => {
          console.error('Error', error);
        });
      });
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
  }, 1000000);

});


// Start server
server.listen(3000, () => console.log('listening on localhost:3000'));
