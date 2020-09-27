import eventlet
import socketio

import os

# TODO: inverter dependência
from src.controller import controller

sio = socketio.Server(transports=["websocket", "polling"])
app = socketio.WSGIApp(sio)

@sio.event
def connect(sid, eviron):
    sio.enter_room(sid, room="mobile")
    controller("oninitialconnection", None, sio)

@sio.event
def smartevent(sid, data):
    controller(data.get("event"), data.get("payload"), sio)

@sio.event
def disconnect(sid):
    # sio.rooms = {}
    print("disconnect ", sid)

eventlet.wsgi.server(eventlet.listen(("", 3000)), app)
