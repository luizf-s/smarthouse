import json

import src.entities
import src.repository

# GELADEIRA
def atualizar_nivel_agua(novo_nivel: int):
    src.repository.atualizar_nivel_agua(novo_nivel)
    valor_desejado = src.repository.get_nivel_de_agua_minima()
    return novo_nivel, valor_desejado


def atualizar_alimento(registro_alimento):
    nova_lista = src.repository.atualizar_alimento(registro_alimento)
    return nova_lista

def atualizar_comodo_temperatura(id_new_temperature):
    room_id, new_temp = id_new_temperature.split(",")
    lista_comodos = src.repository.atualizar_comodo_temperatura(room_id, new_temp)
    return lista_comodos

def atualizar_comodo_luminosidade(id_new_lum):
    room_id, new_lum = id_new_lum.split(",")
    lista_comodos = src.repository.atualizar_comodo_luminosidade(room_id, new_lum)
    return lista_comodos

def atualizar_comodo_temperatura_setpoint(id_new_setpoint):
    room_id, new_setpoint = id_new_setpoint.split(",")
    lista_comodos = src.repository.atualizar_comodo_temperatura_setpoint(room_id, new_setpoint)
    return lista_comodos

def atualizar_comodo_luminosidade_setpoint(id_new_setpoint):
    room_id, new_setpoint = id_new_setpoint.split(",")
    lista_comodos = src.repository.atualizar_comodo_luminosidade_setpoint(room_id, new_setpoint)
    return lista_comodos

def ligardesligar_comodo_temperatura(id_comodo):
    return src.repository.ligardesligar_comodo_arcondicionado(id_comodo)

def ligardesligar_comodo_luminosidade(id_comodo):
    return src.repository.ligardesligar_comodo_luz(id_comodo)

def get_all_data() -> dict:
    return src.repository.get_all()
