# Introdução

O projeto que faremos é de uma casa inteligente. Possui basicamente dois grupos de funcionalidades:
· De monitoramento de iluminação e temperatura dos cômodos.
· De monitoramente de lista de alimentos e nível de água filtrada na geladeira.

Não escreveremos os firmwares dos dispositivos IoT da geladeira nem dos cômodos; porém assumiremos que os dispositivos fazem o seguinte:
- A geladeira possui um dispositivo com *touchscreen* em que é possível entrar com dados de alimentos: o nome de um alimento e sua quantidade;
- A geladeira possui um sensor de nível em um pequeno tanque de água embutido na geladeira;
- Os cômodos têm termômetros e sensores de iluminância;
- Os cômodos têm ar condicionado que se comunicam pela rede wifi;
- As lâmpadas dos cômodos podem ter o brilho ajustado por dispositivo que se comunica pela rede wifi;

Requisitos:
- Conhecimento básico em python, javascript, uso do sistema operacional, comandos básicos no shell
- Ter instalado: nodejs, python
- Ter instalado (opcional): docker, emulador de dispositivo mobile, gerenciador de sdk do Android (disponível no Android Studio)

O desenvolvimento desse projeto foi feito no Linux. Podem ser necessárias adaptações para que seja feito no Windows.

# Configurando o ambiente

Vamos configurar o ambiente de desenvolvimento em 2 partes: servidor e mobile.
O servidor será escrito em python e o mobile em javascript ou typescript, sendo utilizado React Native para o projeto.

https://reactnative.dev/

Vamos inicialmente criar uma estrutura de pastas. Em um diretório escolhido (que a partir de agora será escrito sempre como $PROJECT_DIR como **placeholder** - crie com no local que achar mais adequado e com o nome de sua preferência), vamos criar uma pasta "servidor":

$ mkdir $PROJECT_DIR && cd $PROJECT_DIR
$ mkdir servidor

## Configurando o desenvolvimento do servidor

Podemos utilizar um ambiente conteinerizado com Docker ou ambiente virtual python (venv). Caso deseje utilizar ambiente conteinerizado, criaremos a imagem segundo o dockerfile:

$ cd $PROJECT_DIR
$ touch dockerfile

// Dockerfile
```dockerfile
FROM python:3

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

CMD ["flask", "run"]
```

Caso prefira utilizar ambiente virtual do python, siga as instruções em https://docs.python.org/3/library/venv.html?highlight=venv.

Vamos então criar o arquivo que persistirá alista de dependências do servidor e colocar as dependências necessárias:

$ touch requirements.txt

// requirements.txt
python-socketio
eventlet

Caso tenha optado por utilizar um ambiente conteinerizado, construa a imagem e entre no container:

$ docker build . -t smarthouse
$ docker run -it -p 3000:3000 -v $(pwd):/app smarthouse bash


Para mais informações sobre o dockerfile e a cli do docker:
https://docs.docker.com/engine/reference/builder/
https://docs.docker.com/engine/reference/commandline/cli/

## Configurando o desenvolvimento mobile

Um passo a passo de como configurar o ambiente de desenvolvimento mobile com React Native pode ser visto no link:
https://react-native.rocketseat.dev/

Após ter o ambiente configurado, na pasta do projeto deve ser possível executar o comando para criar a aplicação mobile:

$ npx create-react-native-app client

# WebSocket

É interessante que o leitor conheça pelo menos um pouco a respeito de websocket antes de prosseguir. Caso o leitor nunca tenha lido, trabalhado ou ouvido falar nada a respeito, separe alguns minutos para entender como funciona o websocket através da documentação:
https://developer.mozilla.org/pt-BR/docs/WebSockets

Usaremos uma biblioteca no cliente e no servidor que abstrai o protocolo de maneira que não precisemos pensar em detalhes de chamada e de armazenamento de identificadores e rotas. Separe também um tempo para estudar as bibliotecas utilizados no cliente e no servidor:
Cliente: https://socket.io/
Servidor: https://python-socketio.readthedocs.io/en/latest/

# Escrevendo o servidor - comunicação via websocket

Vamos criar uma estrutura inicial do projeto e escrever a interface que será utilizada como comunicação com o servidor:

$ mkdir src
$ touch app.py src/{controller,socketconnection}.py

Primeiramente vamos escrever um módulo de inicalização do servidor:

// app.py
```python3
import src.socketconnection
```

Depois vamos escrever o módulo que estabelece as conexões via websocket e as redirecionam para um controlador.
// src/socketconnection.py
```python3
import eventlet
import socketio

import os

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
    sio.rooms = {}
    print("disconnect ", sid)

eventlet.wsgi.server(eventlet.listen(("", 3000)), app)
```

# Escrevendo o servidor - controller e usecases

O controlador receberá um pacote do módulo responsável por estabelecer e gerenciar as conexões; será responsabilidade do controlador saber qual função de caso de uso chamar para cada envento recebido, bem como a partir da resposta do caso de uso enviar um pacote de resposta para a sala (**room**) de dispositivos conectados para atualização das informações.

// src/controller.py
```python3
from functools import partial
from typing import Union

import src.usecases


def initialconnection(socket_connection):
    print("oninitialconnection")
    socket_connection.emit("initialconnection", src.usecases.get_all_data())


def update_fridge_water_level(socket_connection, payload):
    novo_nivel, valor_desejado = src.usecases.atualizar_nivel_agua(payload)
    print(f"update_fridge_water_level, {novo_nivel}, {valor_desejado}")
    socket_connection.emit(
        "updateData",
        {
            "event": "UPDATE_FRIDGE_WATER_LEVEL",
            "payload": {"nivel": novo_nivel, "setpoint": valor_desejado},
        },
    )


def update_food(socket_connection, payload):
    nova_lista_alimentos = src.usecases.atualizar_alimento(payload)
    socket_connection.emit(
        "updateData", {"event": "UPDATE_FOOD", "payload": nova_lista_alimentos}
    )


def update_room_temperature(socket_connection, payload):
    """payload: str = id_comodo,nova_temperatura"""
    nova_lista_comodos = src.usecases.atualizar_comodo_temperatura(payload)
    socket_connection.emit(
        "updateData",
        {"event": "UPDATE_ROOM_TEMPERATURE", "payload": nova_lista_comodos},
    )


def update_room_luminosity(socket_connection, payload):
    """payload: str = id_comodo,nova_luminosidade"""
    nova_lista_comodos = src.usecases.atualizar_comodo_luminosidade(payload)
    socket_connection.emit(
        "updateData", {"event": "UPDATE_ROOM_LUMINOSITY", "payload": nova_lista_comodos}
    )


def update_room_temperature_setpoint(socket_connection, payload):
    """payload: str = id_comodo,nova_temp_setpoint"""
    nova_lista_comodos = src.usecases.atualizar_comodo_temperatura_setpoint(payload)
    socket_connection.emit(
        "updateData",
        {"event": "UPDATE_ROOM_TEMPERATURE_SETPOINT", "payload": nova_lista_comodos},
    )


def update_room_luminosity_setpoint(socket_connection, payload):
    """payload: str = id_comodo,nova_lum_setpoint"""
    nova_lista_comodos = src.usecases.atualizar_comodo_luminosidade_setpoint(payload)
    socket_connection.emit(
        "updateData",
        {"event": "UPDATE_ROOM_LUMINOSITY_SETPOINT", "payload": nova_lista_comodos},
    )


def update_room_temperature_onoff(socket_connection, payload):
    """payload: str = id_comodo"""
    nova_lista_comodos = src.usecases.ligardesligar_comodo_temperatura(payload)
    socket_connection.emit(
        "updateData",
        {"event": "TOGGLE_ROOM_TEMPERATURE", "payload": nova_lista_comodos},
    )


def update_room_luminosity_onoff(socket_connection, payload):
    """payload: str = id"""
    nova_lista_comodos = src.usecases.ligardesligar_comodo_luminosidade(payload)
    socket_connection.emit(
        "updateData", {"event": "TOGGLE_ROOM_LIGHT", "payload": nova_lista_comodos}
    )


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
```

Finalmente temos os casos de uso que devem gerenciar como deve ser tratado os dados do evento recebido e criar os novos dados a partir do dados recebidos para que o controlador atualize o estado do sistema.
No caso desse sistema há somente atualização de valores (sejam numéricos, texto ou booleanos - no caso de ligar/desligar dispositivos de ambientação). Então não é de surpreender que os casos de uso tão somente chame funções do módulo responsável pela persistência de dados como se fosse essa a "regra de negócio".

// src/usecases.py
```python
import json

import src.entities
import src.repository

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
    lista_comodos = src.repository.atualizar_comodo_temperatura_setpoint(
        room_id, new_setpoint
    )
    return lista_comodos


def atualizar_comodo_luminosidade_setpoint(id_new_setpoint):
    room_id, new_setpoint = id_new_setpoint.split(",")
    lista_comodos = src.repository.atualizar_comodo_luminosidade_setpoint(
        room_id, new_setpoint
    )
    return lista_comodos


def ligardesligar_comodo_temperatura(id_comodo):
    return src.repository.ligardesligar_comodo_arcondicionado(id_comodo)


def ligardesligar_comodo_luminosidade(id_comodo):
    return src.repository.ligardesligar_comodo_luz(id_comodo)


def get_all_data() -> dict:
    return src.repository.get_all()
```

Nota: precisamos persistir os dados de alguma forma. Fica a escolha do leitor como prefere armazenar os dados e portanto, implementar as funções do src/repository.py. No projeto desenvolvido como exemplo foi persistido em um arquivo json no diretório database. No repositório do projeto é possível verificar uma pasta server/database com um arquivo com os dados persistidos bem como um arquivo de modelo em server/database-model.json de como deve ser o json para a nossa aplicação funcionar.

# Testando o servidor

Podemos criar um script para conectar ao servidor e enviar eventos conforme a estrutura esperada pelos controladores para fins de testes manuais.
Vamos criar esse script e rodá-lo com o servidor\*.

// serverclient.py
```python3
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

```

Com o arquivo criado, verifique se o container está rodando, e dentro dele execute:

$ python app.py

Fora do container, no diretório $PROJECT_DIR/server execute:

$ python3 serverclient.py

No prompt ```"> "``` digite os eventos encontrados no controlador seguido de ";" e então valores de identificação e/ou novos valores. Por exemplo:

```
> UPDATE_FRIDGE_WATER_LEVEL;80
> UPDATE_ROOM_TEMPERATURE;1,22.0
> UPDATE_ROOM_TEMPERATURE_SETPOINT;1,17.5
> UPDATE_ROOM_LUMINOSITY;100
> UPDATE_ROOM_LUMINOSITY_SETPOINT;0
> TOGGLE_ROOM_TEMPERATURE;1
> TOGGLE_ROOM_LIGHT;1
```

E para cada evento enviado verifique se foi persistido no banco de dados escolhido.

\*Nota: verifique que a porta que está sendo servido a aplicação, a porta exposta no docker run e a porta do script de teste devem ser a mesma.

# Fazendo a tela do mobile

# Fazendo a comunicação do mobile com o servidor
