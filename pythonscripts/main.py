#!/usr/bin/env python3
"""
Python script for updateing influxdb based on data received form mqtt broker
"""
import paho.mqtt.client as mqtt
import os

# Broker address and port
broker_address = os.environ.get('MQTT_ADDRESS', 'localhost')
broker_port = os.environ.get('MQTT_PORT', 1883)

# Define callback function for received messages
def on_message(client, userdata, msg):
    # Decode and print the message
    message = msg.payload.decode("utf-8")
    print(f"Topic: {msg.topic}, Message: {message}, Client: {client}, Userdata: {userdata}")

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
