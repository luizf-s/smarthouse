from collections import namedtuple
import json

ComodoAtualizacao = namedtuple("ComodoAtualizacao", ("grupo", "chave", "valor"))

def atualizar_nivel_agua(novo_nivel: int):
    print("updating water level")
    all_data = get_all()
    new_data = {
        **all_data,
        "geladeira": {
            **all_data["geladeira"],
            "nivelAgua": {
                "nivel": novo_nivel,
                "setpoint": "50",
            },
        }
    }
    print(new_data)
    with open("./database/data.json", "w") as f:
        print("writing on database")
        json.dump(new_data, f)

def get_lista_alimentos():
    database = get_all()
    comidas = database.get("geladeira", {}).get("comidas")
    return comidas

def atualizar_alimento(alimento):
    print("atualizando geladeira")
    database = get_all()
    comidas = get_lista_alimentos()
    nova_lista = [
        *[c for c in comidas if c.get("id") != alimento.get("id")],
        alimento
    ]
    nova_lista.sort(key=lambda i: i.get("id"))
    new_data = {
        **database,
        "geladeira": {
            **database.get("geladeira"),
            "comidas":  nova_lista,
        }
    }
    with open("./database/data.json", "w") as f:
        print("writing on database")
        json.dump(new_data, f)
    return nova_lista

def get_nivel_de_agua_minima():
    return get_all()["geladeira"]["nivelAgua"]

def atualizar_comodo_temperatura(comodo_id, nova_temperatura):
    comodo_novo_valor = escrever_novo_comodo(
        comodo_id,
        ComodoAtualizacao("clima", "temperatura", nova_temperatura)
    )
    nova_lista = escrever_nova_lista_de_comodos(comodo_id, comodo_novo_valor)
    persistir_comodos(comodo_id, nova_lista)
    return nova_lista

def atualizar_comodo_luminosidade(comodo_id, nova_luminosidade):
    comodo_novo_valor = escrever_novo_comodo(
        comodo_id,
        ComodoAtualizacao("iluminacao", "lumens", nova_luminosidade)
    )
    nova_lista = escrever_nova_lista_de_comodos(comodo_id, comodo_novo_valor)
    persistir_comodos(comodo_id, nova_lista)
    return nova_lista

def atualizar_comodo_temperatura_setpoint(comodo_id, novo_setpoint):
    comodo_novo_valor = escrever_novo_comodo(
        comodo_id,
        ComodoAtualizacao("clima", "setpoint", novo_setpoint)
    )
    nova_lista = escrever_nova_lista_de_comodos(comodo_id, comodo_novo_valor)
    persistir_comodos(comodo_id, nova_lista)
    return nova_lista

def atualizar_comodo_luminosidade_setpoint(comodo_id, novo_setpoint):
    comodo_novo_valor = escrever_novo_comodo(
        comodo_id,
        ComodoAtualizacao("iluminacao", "setpoint", novo_setpoint)
    )
    nova_lista = escrever_nova_lista_de_comodos(comodo_id, comodo_novo_valor)
    persistir_comodos(comodo_id, nova_lista)
    return nova_lista

def ligardesligar_comodo_arcondicionado(comodo_id):
    valor_atual = get_comodo_by_id(comodo_id)["clima"]["ligado"]
    comodo_novo_valor = escrever_novo_comodo(
        comodo_id,
        ComodoAtualizacao("clima", "ligado", not valor_atual)
    )
    nova_lista = escrever_nova_lista_de_comodos(comodo_id, comodo_novo_valor)
    persistir_comodos(comodo_id, nova_lista)
    return nova_lista


def ligardesligar_comodo_luz(comodo_id):
    valor_atual = get_comodo_by_id(comodo_id)["iluminacao"]["ligado"]
    comodo_novo_valor = escrever_novo_comodo(
        comodo_id,
        ComodoAtualizacao("iluminacao", "ligado", not valor_atual)
    )
    nova_lista = escrever_nova_lista_de_comodos(comodo_id, comodo_novo_valor)
    persistir_comodos(comodo_id, nova_lista)
    return nova_lista

def escrever_novo_comodo(comodo_id, novo_valor):
    database = get_all()
    comodos = database["comodos"]
    comodo = get_comodo_by_id(comodo_id)
    novo_comodo = {
        **comodo,
        novo_valor.grupo: {
            **comodo[novo_valor.grupo],
            novo_valor.chave: novo_valor.valor
        }
    }
    return novo_comodo

def escrever_nova_lista_de_comodos(comodo_id, comodo_novo_valor):
    comodos = get_all()["comodos"]
    nova_lista = [
        *[c for c in comodos if c.get("id") != int(comodo_id)],
        comodo_novo_valor
    ]
    return nova_lista

def persistir_comodos(comodo_id, nova_lista):
    database = get_all()
    nova_lista.sort(key=lambda i: i.get("id"))
    new_data = {**database, "comodos": nova_lista}
    save_all(new_data)

def get_comodo_by_id(comodo_id):
    comodos = get_all()["comodos"]
    found = [c for c in comodos if c["id"] == int(comodo_id)]
    if found:
        return found[0]
    return None

def get_all():
    with open("./database/data.json") as f:
        return json.load(f)

def save_all(new_data):
    with open("./database/data.json", "w") as f:
        print("writing on database")
        json.dump(new_data, f)
