#!/usr/bin/env python3
"""
Python script for updateing influxdb based on data received form mqtt broker
"""
import json
import paho.mqtt.client as mqtt
import os
import influxdb_client, os
from datetime import datetime
from influxdb_client import BucketsApi, InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

# Broker address and port
broker_address = os.environ.get('MQTT_ADDRESS', 'localhost')
broker_port = os.environ.get('MQTT_PORT', 1883)
influxdb_token = os.environ.get ('INFLUX_TOKEN')
influx_address = os.environ.get('INFLUX_URL', 'http://localhost:8086')
org = "EsetAutomation"
print(influxdb_token)

# connect to influxdb database
write_client = influxdb_client.InfluxDBClient(url=influx_address, token=influxdb_token, org=org)

def extract_string (topic: str, index: int):
    """ extract a word/string from mqtt topc separated with '/'
    args:
        sopic: (str) topic separated with '/' symbol
        index: (int) location of desired string,
        0 is first from left hand side
    return string or None
    """
    tmp = topic.split('/')
    if len(tmp) > index:
        return tmp[index]
    return None

# Define callback function for received messages
def on_message(client, userdata, msg):
    # Decode and print the message
    message = msg.payload.decode("utf-8")
    # print(f"Topic: {msg.topic}, Message: {message}, Client: {client}, Userdata: {userdata}")

    # Write data to influxdb
    topic=msg.topic #format => company/location/department/asset/variable/sensor_id
    value = json.loads(message).get('value')
    write_api = write_client.write_api(write_options=SYNCHRONOUS)
    # print(value)

    # prepare data for influx storage
    point = (
    Point(extract_string(topic, -2))
    .tag("company", extract_string(topic, 0))
    .tag("location", extract_string(topic, 1))
    .tag("department", extract_string(topic, 2))
    .tag("asset", extract_string(topic, 3))
    .tag("variable", extract_string(topic, 4))
    .tag("sensor_id", extract_string(topic, -1))
    .time(datetime.utcnow(), write_precision=WritePrecision.S)
    .field("value", value)
    )

    #get bucket information, check if bucket exist before creating
    bucket_name = extract_string(topic, 0) #company name
    response = write_client.buckets_api().find_bucket_by_name(bucket_name)
    print(response)
    if response:
        print("bucket exists")
        write_api.write(bucket=extract_string(topic, 0), org=org, record=point, write_precision=WritePrecision.S)
    else:
       print("bucket does not exist")
       response =  BucketsApi(write_client).create_bucket(
           {'bucket_name': bucket_name,
            'org_id': '0c3df5812af8a000',
            'retention_rules': "7d",
            'description': f"{bucket_name} company bucket",
            'org': org,}
        )
       write_api.write(bucket=extract_string(topic, 0), org=org, record=point, write_precision=WritePrecision.S)
# write_api.write('random_float', 'AssetHound', payload, write_precision='s')


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
