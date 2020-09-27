import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('connection established')
    while True:
        message = input("> ")
        event, payload = message.split(";")
        sio.emit("smartevent", {"event": event, "payload": payload})

@sio.event
def my_message(data):
    print('message received with ', data)
    sio.emit('response', {'response': 'my response'})

@sio.event
def disconnect():
    print('disconnected from server')

sio.connect('http://localhost:3000')
sio.wait()

