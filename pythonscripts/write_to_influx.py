

import random
import influxdb_client, os, time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime


INFLUXDB_TOKEN='Li1xenPmrFa9_-4GjBqIBuZdvMRmhm5znZiwfLCfYrwJ7Q6xiIV9WzM5MTpXJNSNPE1WlaBsqMK6wlxWiikNyg=='

token = os.environ.get("INFLUXDB_TOKEN")
org = "EsetAutomation"
url = "http://localhost:8086"

write_client = influxdb_client.InfluxDBClient(url=url, token=INFLUXDB_TOKEN, org=org)


bucket="random_float"

write_api = write_client.write_api(write_options=SYNCHRONOUS)
   
for value in range(20):
  val =  random.uniform(0, 100)
  point = (
    Point("measurement1")
    .tag("tagname1", "tagvalue1")
    .time(datetime.utcnow(), write_precision=WritePrecision.S)
    .field("field1", val)
    .field('counter', value)
  )

  write_api.write(bucket=bucket, org="EsetAutomation", record=point, write_precision=WritePrecision.S)
  time.sleep(1) # separate points by 1 second

query_api =  write_client.query_api()

query = """from(bucket: "random_float")
 |> range(start: -10m)
 |> filter(fn: (r) => r._measurement == "measurement1")
 |> filter(fn: (r) => r._field == "field1")"""

tables = query_api.query(query, org="EsetAutomation")

for table in tables:
  for record in table.records:
    print(record)
