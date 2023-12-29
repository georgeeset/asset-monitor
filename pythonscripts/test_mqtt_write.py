import json
import paho.mqtt.client as mqtt
import random
import os

# Broker address and port
broker_address = os.environ.get('MQTT_ADDRESS', 'localhost')
broker_port = int(os.environ.get('MQTT_PORT', 1883))

# broker_address = 'localhost'
# broker_port = 1883

# Publish channel
publish_channel = "EsetAutomaiton/Lagos/Utility/AHU/vibration/4332wz" 
#format => company/location/department/asset/variable/sensor_id

# Setup timer
import time

def publish_random_float():
    # Generate random float between 0 and 100
    random_float = random.uniform(0, 30)

    # Prepare message as JSON string
    message = {"value": random_float}
    print(message)
    message_json = json.dumps(message)

    # Publish message to the channel
    client.publish(publish_channel, message_json)

# Create an MQTT client object
client = mqtt.Client()

print(type(broker_address), type(broker_port))
# Connect to the broker
client.connect(broker_address, broker_port)

# Start publishing loop
while True:
    publish_random_float()
    time.sleep(10) #secs

# Disconnect from the broker when script ends
client.disconnect()