from functools import partial
from typing import Union

import src.usecases

def initialconnection(socket_connection):
    print("oninitialconnection")
    socket_connection.emit("initialconnection", src.usecases.get_all_data())

def update_fridge_water_level(socket_connection, payload):
    novo_nivel, valor_desejado = src.usecases.atualizar_nivel_agua(payload)
    print(f"update_fridge_water_level, {novo_nivel}, {valor_desejado}")
    socket_connection.emit("updateData", {
        "event": "UPDATE_FRIDGE_WATER_LEVEL",
        "payload": {"nivel": novo_nivel, "setpoint": valor_desejado}
    })

def update_food(socket_connection, payload):
    print("==== update_food ====")
    print(payload)
    nova_lista_alimentos = src.usecases.atualizar_alimento(payload)
    socket_connection.emit("updateData", {
        "event": "UPDATE_FOOD",
        "payload": nova_lista_alimentos
    })

def update_room_temperature(socket_connection, payload):
    """payload: str = id_comodo,nova_temperatura"""
    nova_lista_comodos = src.usecases.atualizar_comodo_temperatura(payload)
    socket_connection.emit("updateData", {
        "event": "UPDATE_ROOM_TEMPERATURE",
        "payload": nova_lista_comodos
    })

def update_room_luminosity(socket_connection, payload):
    """payload: str = id_comodo,nova_luminosidade"""
    nova_lista_comodos = src.usecases.atualizar_comodo_luminosidade(payload)
    socket_connection.emit("updateData", {
        "event": "UPDATE_ROOM_LUMINOSITY",
        "payload": nova_lista_comodos
    })

def update_room_temperature_setpoint(socket_connection, payload):
    """payload: str = id_comodo,nova_temp_setpoint"""
    nova_lista_comodos = src.usecases.atualizar_comodo_temperatura_setpoint(payload)
    socket_connection.emit("updateData", {
        "event": "UPDATE_ROOM_TEMPERATURE_SETPOINT",
        "payload": nova_lista_comodos
    })

def update_room_luminosity_setpoint(socket_connection, payload):
    """payload: str = id_comodo,nova_lum_setpoint"""
    nova_lista_comodos = src.usecases.atualizar_comodo_luminosidade_setpoint(payload)
    socket_connection.emit("updateData", {
        "event": "UPDATE_ROOM_LUMINOSITY_SETPOINT",
        "payload": nova_lista_comodos
    })

def update_room_temperature_onoff(socket_connection, payload):
    """payload: str = id_comodo"""
    nova_lista_comodos = src.usecases.ligardesligar_comodo_temperatura(payload)
    socket_connection.emit("updateData", {
        "event": "TOGGLE_ROOM_TEMPERATURE",
        "payload": nova_lista_comodos
    })

def update_room_luminosity_onoff(socket_connection, payload):
    """payload: str = id"""
    nova_lista_comodos = src.usecases.ligardesligar_comodo_luminosidade(payload)
    socket_connection.emit("updateData", {
        "event": "TOGGLE_ROOM_LIGHT",
        "payload": nova_lista_comodos
    })


actions = {
    "oninitialconnection": lambda s, d: initialconnection(s),
    "UPDATE_FRIDGE_WATER_LEVEL": update_fridge_water_level,
    "UPDATE_FOOD": update_food,
    "UPDATE_ROOM_TEMPERATURE": update_room_temperature,
    "UPDATE_ROOM_TEMPERATURE_SETPOINT": update_room_temperature_setpoint,
    "UPDATE_ROOM_LUMINOSITY": update_room_luminosity,
    "UPDATE_ROOM_LUMINOSITY_SETPOINT": update_room_luminosity_setpoint,
    "TOGGLE_ROOM_TEMPERATURE": update_room_temperature_onoff,
    "TOGGLE_ROOM_LIGHT": update_room_luminosity_onoff,
}

def controller(event: str, data, socket_connection):
    actions.get(event, lambda _: _)(socket_connection, data)

