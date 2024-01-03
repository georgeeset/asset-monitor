#!/usr/bin/env node

import express, { response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connect from './config/db.js';
import { InfluxDB } from '@influxdata/influxdb-client';
import { triggerAsyncId } from 'async_hooks';

import mqtt from 'mqtt';
import { format } from 'path';


dotenv.config({ path: '.env' });
// Set your InfluxDB configuration
const influxUrl = process.env.INFLUX_URL;
const influxToken = process.env.INFLUX_TOKEN;
const influxOrg = process.env.INFLUX_ORG;

// For test only
const COMPANY_NAME = "EsetAutomaiton";

// Instantiate the InfluxDB client with the provided configuration
const influx = new InfluxDB({ url: influxUrl, token: influxToken, org: influxOrg });
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
nsp.on('connection', function (socket) {
  // console.log('someone connected');
  socket.emit('message', { description: 'Hay, welcome' });
  socket.send('Hello from server');
  /**
   *  Subscribe the client to the channel
   * use the socket data of user to determine the
   * chennel name which should likely be the company and location name
   * for test purposes, the name is fixed at newconnection
   * from docs, channels are closed automatically if no one is listening
   */
  socket.join('newclientconnect');

  // send priveate message to client
  socket.send(`welcome, your session id is: ${socket.id}`)
  //send a welcome message to all
  nsp.to('newclientconnect').emit("message", "new client just joined");

  socket.on('disconnect', async (reason) => {
    console.log(reason);
    socket.emit('newclientconnect', { description: "client disconnected" });
    // mqttClient.end(); //disconnect from mqtt
    const count = await nsp.in('newclientconnect').fetchSockets();
    console.log(count.length);
    if (count.length < 1) {
      mqttClient.unsubscribe(`${COMPANY_NAME}/#`);
    }
    // mqttClient.unsubscribe(`${COMPANY_NAME}/#`); // unsubscribe
    // socket.leave('newclientconnect');
  });

  socket.on('message', function (data) {
    console.log(`recieved form message ${data}`);

    if (data == "getRecentData") {
      /**
       * TODO--------------
       * get sensor infomation from mongodb database
       * then get the query string of the sensor before
       * quering influx for data so that the user is restricted
       * to his sensor data only.
      */
      // const query = 'SELECT * FROM EsetAutomation WHERE time > now() - 6h';
      const fluxQuery = `from(bucket: "${COMPANY_NAME}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "vibration")`;


      // Create an async function to query gand log new data
      const myQuery = async () => {
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
          const obj = tableMeta.toObject(values);

          const responseData = new Map([
            ['company_name', obj.company],
            ['location', obj.location],
            ['department', obj.department],
            ['asset', obj.asset],
            ['measurement', obj._measurement],
            ['sensor_id', obj.sensor_id],
            ['date_time', obj._time],
            ['value', obj._value],
          ]);
          // console.log(JSON.stringify(Object.fromEntries(responseData)));
          // nsp.to('newclientconnect').emit('message', Object.fromEntries(responseData));
          // console.log(`${obj._time} ${obj._measurement} in '${obj.location}' (${obj.sensor_id}): ${obj._field}=${obj._value}`);
          socket.send(Object.fromEntries(responseData));
        }
      };
      myQuery().then(async (value) => {
        // client.on('connect', ()=>{
        //   console.log('Connected to MQTT broker');
        //   client.subscribe('COMPANY_NAME/#');
        // });
        const count = await nsp.in('newclientconnect').fetchSockets();
        console.log(count.length);
        if (count.length > 1) {
          return; // if clients already exist, no need to subscribe mqtt
          // mqttClient.subscribe(`${COMPANY_NAME}/#`);
        }

        mqttClient.subscribe(`${COMPANY_NAME}/#`);

        mqttClient.on('message', (topic, message) => {
          // console.log(message.toString());
          //"EsetAutomaiton/Lagos/Utility/AHU/vibration/4332wz"
          const message_info = topic.split('/');
          let dataFormat = [
            ['company_name'],
            ['location'],
            ['department'],
            ['asset'],
            ['measurement'],
            ['sensor_id'],
            ['date_time'],
            ['value']
          ];

          for (let i = 0; i < message_info.length; i++) {
            dataFormat[i].push(message_info[i]);
          }
          const now = new Date(); // get current date and time
          dataFormat[dataFormat.length - 1].push(JSON.parse(message).value); // vill value
          dataFormat[dataFormat.length - 2].push(now.toISOString()); //fill time in utc iso
          // console.log(dataFormat);

          const responseData = new Map(dataFormat);
          // console.log(JSON.stringify(Object.fromEntries(responseData)));
          nsp.to('newclientconnect').emit('message', Object.fromEntries(responseData));
        });

        mqttClient.on('disconnecting', (reason) => {
          console.log('disconnecting from disconnecting')
        });

        mqttClient.on('error', (error) => {
          console.error('Error', error);
        });
      });
    }
  });

  socket.on('newclientconnect', (data) => {
    console.log(data)
  });

  setTimeout(function () {
    socket.emit('newclientconnect', function () {
      console.log('A user timedout');
      socket.disconnect();
    });
  }, 1000000);

});


// Start server
server.listen(3000, () => console.log('listening on localhost:3000'));
