import paho.mqtt.client as mqtt
from struct import unpack
from time import sleep

TOPIC = "smarthouse"

def on_connect(client, data, null, rc):
    print("")
    client.subscribe([(TOPIC, 0)])

def on_message(handle_message):
    def on_message_inner(client, userdata, msg):
        v = unpack(">H", msg.payload)[0]
        handle_message(v)
    return on_message_inner

def get_client(handle_message):
    client = mqtt.Client(client_id="iotserver", protocol=mqtt.MQTTv31)

    client.on_connect = on_connect
    client.on_message = on_message(handle_message)

    client.connect("127.0.0.1", 1883)

    client.loop_forever()

