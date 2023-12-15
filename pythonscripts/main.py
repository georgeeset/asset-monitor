#!/usr/bin/env python3
"""
Python script for updateing influxdb based on data received form mqtt broker
"""
import json
import paho.mqtt.client as mqtt
import os
import influxdb_client, os, time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

# Broker address and port
broker_address = os.environ.get('MQTT_ADDRESS', 'localhost')
broker_port = os.environ.get('MQTT_PORT', 1883)
influxdb_token = os.environ.get ('INFLUX_TOKEN')
influx_address = os.environ.get('INFLUX_URL', 'http://localhost:8086')
org = "AssetHound"
print(influxdb_token)

# connect to influxdb database
write_client = influxdb_client.InfluxDBClient(url=influx_address, token=influxdb_token, org=org)

# Define callback function for received messages
def on_message(client, userdata, msg):
    # Decode and print the message
    message = msg.payload.decode("utf-8")
    print(f"Topic: {msg.topic}, Message: {message}, Client: {client}, Userdata: {userdata}")

    # Write data to influxdb
    bucket=msg.topic
    value = json.loads(message).get('value')
    write_api = write_client.write_api(write_options=SYNCHRONOUS)

    point = (
        Point("measurement1")
        .tag("tagname1", "tagvalue1")
        .field("field1", value)
    )
    write_api.write(bucket=bucket, org="AssetHound", record=point)


# Create an MQTT client object
client = mqtt.Client()

# Set callback function for received messages
client.on_message = on_message

# Connect to the broker
client.connect(broker_address, broker_port)

# Subscribe to all channels with wildcard "#" (be cautious with performance implications)
client.subscribe("#")

# Keep the script running
client.loop_forever()
