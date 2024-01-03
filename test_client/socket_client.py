import socketio

# Server address and port
server_address = "http://api.esetautomation.tech/socket/v1/"
server_port = 80

# Initialize SocketIO client
sio = socketio.Client()


# @sio.event
# def connect():
#     print("I'm connected!")
#     mesg = "Hello from client!"
#     sio.send(mesg)

@sio.event(namespace='/my_assets')
def connect():
    print("Connected to the server!")
    
    # Subscribe to the 'newclientconnect' event
    # sio.emit("subscribe", "newclientconnect", "/my_assets")

    # Emit the message to the 'newclientconnect' event
    sio.emit("newclientconnect", 'Im new here', "/my_assets")

    #send request to getRecentData channel
    sio.send("getRecentData", "/my_assets")


@sio.event(namespace='/my_assets')
def connect_error(data):
    print("The connection failed!", data)

@sio.event(namespace='/my_assets')
def disconnect():
    print("I'm disconnected!")

@sio.on('message', namespace = '/my_assets')
def message(data):
    print(data)

@sio.on('getRecentData', namespace = '/my_assets')
def get_resent_data(data):
    print(data)


@sio.on('newclientconnect', namespace='/my_assets')
def newclientconnect(data = None):
    print('recieved form channel newclientconnect', data)

@sio.on('getRecentData', namespace='/my_assets')
def get_recent_data(data = None):
    print('recent data:', data)


sio.connect(server_address, namespaces=['/my_assets'], headers={'user':'python'})


# Send message to server




# Wait for server response
# while True:
#     sio.wait()