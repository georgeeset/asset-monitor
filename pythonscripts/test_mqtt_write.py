import json
import paho.mqtt.client as mqtt
import random

# Broker address and port
broker_address = "localhost"
broker_port = 1883

# Publish channel
publish_channel = "random_floats"

# Setup timer with 1 second interval
import time

def publish_random_float():
    # Generate random float between 0 and 100
    random_float = random.uniform(0, 100)

    # Prepare message as JSON string
    message = {"value": random_float}
    print(message)
    message_json = json.dumps(message)

    # Publish message to the channel
    client.publish(publish_channel, message_json)

# Create an MQTT client object
client = mqtt.Client()

# Connect to the broker
client.connect(broker_address, broker_port)

# Start publishing loop
while True:
    publish_random_float()
    time.sleep(1)

# Disconnect from the broker when script ends
client.disconnect()