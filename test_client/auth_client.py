import socketio
import json
# Server address and port
server_address = "http://localhost:3000"

# Initialize SocketIO client
sio = socketio.Client()


# @sio.event
# def connect():
#     print("I'm connected!")
#     mesg = "Hello from client!"
#     sio.send(mesg)

@sio.event(namespace='/user')
def connect():
    print("Connected to the server!")
    
    # Subscribe to the 'newclientconnect' event
    # sio.emit("subscribe", "newclientconnect", '/user')

    # Emit the message to the 'newclientconnect' event
    sio.emit("newclientconnect", 'Im new here', '/user')

    #send request to getRecentData channel
    sio.send("getRecentData", '/user')


@sio.event(namespace='/user')
def connect_error(data):
    print("The connection failed!", data)

@sio.event(namespace='/user')
def disconnect():
    print("I'm disconnected!")

@sio.on('message', namespace = '/user')
def message(data):
    if (isinstance(data, dict) and 'value' in data.keys()):
        print(f"{data['value']}, {data['date_time']}")
    else:
        print(data)

@sio.on('getRecentData', namespace = '/user')
def get_resent_data(data):
    print(data)


@sio.on('newclientconnect', namespace='/user')
def newclientconnect(data = None):
    print('recieved form channel newclientconnect', data)

@sio.on('getRecentData', namespace='/user')
def get_recent_data(data = None):
    print('recent data:', data)


sio.connect(server_address, namespaces=['/user'], headers={'user':'python'})


# Send message to server




# Wait for server response
# while True:
sio.wait()