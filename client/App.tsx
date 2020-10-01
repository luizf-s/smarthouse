import React, { useEffect, useReducer, useState } from 'react';
import {
    Button,
    FlatList,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    YellowBox,
} from 'react-native';

import io from 'socket.io-client';

const INITIAL_STATE = {
    geladeira: {
        nivelAgua: 0,
        comidas: []
    },
    comodos: []
};

const INITIAL_FOOD_MODAL = {
    visible: false,
};

const INITIAL_TEMPERATURE_MODAL = {
    visible: false,
    clima: {
        setpoint: 0,
    },
    iluminacao: {
        setpoint: 0,
    }
};

const INITIAL_LIGHT_MODAL = {
    visible: false,
    clima: {
        setpoint: 0,
    },
    iluminacao: {
        setpoint: 0,
    }
};

//   ____    _    __  __ ____ ___    _    ____  ____      _
//  / ___|  / \  |  \/  | __ )_ _|  / \  |  _ \|  _ \    / \
// | |  _  / _ \ | |\/| |  _ \| |  / _ \ | |_) | |_) |  / _ \
// | |_| |/ ___ \| |  | | |_) | | / ___ \|  _ <|  _ <  / ___ \
//  \____/_/   \_\_|  |_|____/___/_/   \_\_| \_\_| \_\/_/   \_\
//
YellowBox.ignoreWarnings(['Setting a timer']);
console.warn = message => { };

const onConnect = (socket, setStatus) => {
    socket.emit("smartevent", { event: "oninitialconnection", payload: {} });
    setStatus("Conectado ao servidor!");
}

const onDisconnect = (setStatus) => {
    setStatus("Disconnected")
}

const onError = console.error;

const onInitialConnection = (payload, dispatchGeneralState) => {
    console.clear();
    dispatchGeneralState({ type: MAIN_ACTIONS.UPDATE_ALL, payload });
}

const onUpdateData = (serverAction, dispatchGeneralState) => {
    dispatchGeneralState({ type: serverAction.event, payload: serverAction.payload });
};

interface Data {
    geladeira: FridgeData;
    comodos: Array<RoomData>;
};

interface FridgeData {
    nivelAgua: float;
    comidas: Array<FoodData>;
}

interface FoodData {
    id: number;
    nome: string;
    quantidade: string;
}

interface RoomData {}

interface Action {
    type: string;
    payload: payloadType;
};

type payloadType = number | fridgeItemProps;

const MAIN_ACTIONS = {
    UPDATE_ALL: "UPDATE_ALL",
    UPDATE_FRIDGE_WATER_LEVEL: "UPDATE_FRIDGE_WATER_LEVEL",
    UPDATE_FOOD: "UPDATE_FOOD",
    TOGGLE_ROOM_TEMPERATURE: "TOGGLE_ROOM_TEMPERATURE",
    TOGGLE_ROOM_LIGHT: "TOGGLE_ROOM_LIGHT",
    UPDATE_ROOM_TEMPERATURE: "UPDATE_ROOM_TEMPERATURE",
    UPDATE_ROOM_TEMPERATURE_SETPOINT: "UPDATE_ROOM_TEMPERATURE_SETPOINT",
    UPDATE_ROOM_LUMINOSITY: "UPDATE_ROOM_LUMINOSITY",
    UPDATE_ROOM_LUMINOSITY_SETPOINT: "UPDATE_ROOM_LUMINOSITY_SETPOINT",
};

const setDataReducer = (state, action) => {
    console.log(action);
    switch(action.type) {
        case MAIN_ACTIONS.UPDATE_ALL:
            return action.payload;
        case MAIN_ACTIONS.UPDATE_FRIDGE_WATER_LEVEL:
            return {
                ...state,
                geladeira: {
                    ...state.geladeira,
                    nivelAgua: action.payload,
                }
            };
        case MAIN_ACTIONS.UPDATE_FOOD:
            return {
                ...state,
                geladeira: {
                    ...state.geladeira,
                    comidas: action.payload
                }
            };
        case MAIN_ACTIONS.TOGGLE_ROOM_TEMPERATURE:
        case MAIN_ACTIONS.TOGGLE_ROOM_LIGHT:
        case MAIN_ACTIONS.UPDATE_ROOM_TEMPERATURE:
        case MAIN_ACTIONS.UPDATE_ROOM_LUMINOSITY:
        case MAIN_ACTIONS.UPDATE_ROOM_TEMPERATURE_SETPOINT:
        case MAIN_ACTIONS.UPDATE_ROOM_LUMINOSITY_SETPOINT:
            return {
                ...state,
                comodos: action.payload
            };
        default:
            return state;
    }
};

const FOOD_ACTIONS = {
    TOGGLE_MODAL: "TOGGLE_MODAL",
    UPDATE_VALUE: "UPDATE_VALUE",
};

const setFoodReducer = (state, action) => {
    switch(action.type) {
        case FOOD_ACTIONS.TOGGLE_MODAL:
            return {
                ...state,
                visible: !state.visible,
                ...action.payload,
            };
        case FOOD_ACTIONS.UPDATE_VALUE:
            return {
                ...state,
                ...action.payload
            }
        default:
            return state;
    }
};

const TEMPERATURE_ACTIONS = {
    TOGGLE_MODAL: "TOGGLE_MODAL",
    UPDATE_VALUE: "UPDATE_VALUE",
};

const setTemperatureReducer = (state, action) => {
    switch(action.type) {
        case TEMPERATURE_ACTIONS.TOGGLE_MODAL:
            return {
                ...state,
                visible: !state.visible,
                ...action.payload,
            };
        case TEMPERATURE_ACTIONS.UPDATE_VALUE:
            return {
                ...state,
                ...action.payload
            }
        default:
            return state;
    }
};

const LIGHT_ACTIONS = {
    TOGGLE_MODAL: "TOGGLE_MODAL",
    UPDATE_VALUE: "UPDATE_VALUE",
};

const setLightReducer = (state, action) => {
    switch(action.type) {
        case LIGHT_ACTIONS.TOGGLE_MODAL:
            return {
                ...state,
                visible: !state.visible,
                ...action.payload,
            };
        case LIGHT_ACTIONS.UPDATE_VALUE:
            return {
                ...state,
                ...action.payload
            }
        default:
            return state;
    }
};

// TODO: interface de objeto de handlers?
const setupServerConnection = ({ setStatus, dispatchGeneralState }) => {
    try {
        // TODO: extair para variáveis (ambiente?)
        const socket = io("http://10.1.0.122:3000", {"transports": ["websocket", "polling"]});
        socket.on("connect", () => onConnect(socket, setStatus));
        socket.on("updateData", serverAction => onUpdateData(serverAction, dispatchGeneralState));
        socket.on("initialconnection", (payload) => onInitialConnection(payload, dispatchGeneralState));
        socket.on("disconnect", () => onDisconnect(setStatus));
        socket.on("error", onError);
        return socket;
    } catch (err) {
        console.error(err);
    }
};

const saveNewFoodValue = (socket) => (newValue) => socket.emit(
    "smartevent",
    { event:"UPDATE_FOOD", payload: newValue }
);

const saveNewTemperature = (socket) => (roomId, newSetpoint) => socket.emit(
    "smartevent",
    { event: "UPDATE_ROOM_TEMPERATURE_SETPOINT", payload: `${roomId},${newSetpoint}` }
);

const saveNewLuminosity = (socket) => (roomId, newSetpoint) => socket.emit(
    "smartevent",
    { event: "UPDATE_ROOM_LUMINOSITY_SETPOINT", payload: `${roomId},${newSetpoint}`}
);

const toggleTemperatureForRoom = (socket) => (roomId) => socket.emit(
    "smartevent",
    { event: "TOGGLE_ROOM_TEMPERATURE", payload: roomId }
);

const toggleLightForRoom = (socket) => (roomId) => socket.emit(
    "smartevent",
    { event: "TOGGLE_ROOM_LIGHT", payload: roomId }
);

export default function App() {
    const [connectionStatus, setConnectionStatus] = useState<string>("Sem conexão");
    const [data, dispatchGeneralState] = useReducer<Data>(setDataReducer, INITIAL_STATE);
    const [foodModal, dispatchFoodModal] = useReducer(setFoodReducer, INITIAL_FOOD_MODAL);
    const [temperatureModal, dispatchTemperatureModal] = useReducer(setTemperatureReducer, INITIAL_TEMPERATURE_MODAL);
    const [lightModal, dispatchLightModal] = useReducer(setLightReducer, INITIAL_LIGHT_MODAL);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketInit = setupServerConnection({ setStatus: setConnectionStatus, dispatchGeneralState });
        setSocket(socketInit);
    }, []);

    const updateFood = saveNewFoodValue(socket);
    const updateTemperature = saveNewTemperature(socket);
    const updateLuminosity = saveNewLuminosity(socket);
    const toggleTemperatureRoom = toggleTemperatureForRoom(socket);
    const toggleLightRoom = toggleLightForRoom(socket);

    return (
        <View style={styles.container}>
            <FoodModal
                foodModalData={foodModal}
                onValueChange={item => dispatchFoodModal({ type: FOOD_ACTIONS.UPDATE_VALUE, payload: item})}
                onSave={(newValue) => {
                    console.log(newValue);
                    updateFood(newValue);
                    dispatchFoodModal({ type: FOOD_ACTIONS.TOGGLE_MODAL });
                }}
                onCancel={() => dispatchFoodModal({ type: FOOD_ACTIONS.TOGGLE_MODAL })}
            />
            <TemperatureModal
                temperatureModalData={temperatureModal}
                onValueChange={item => dispatchTemperatureModal({ type: TEMPERATURE_ACTIONS.UPDATE_VALUE, payload: item })}
                onSave={(id, newSetpoint) => {
                    updateTemperature(id, newSetpoint);
                    dispatchTemperatureModal({ type: TEMPERATURE_ACTIONS.TOGGLE_MODAL });
                }}
                onCancel={() => dispatchTemperatureModal({ type: TEMPERATURE_ACTIONS.TOGGLE_MODAL })}
            />
            <LightModal
                lightModalData={lightModal}
                onValueChange={item => dispatchLightModal({ type: LIGHT_ACTIONS.UPDATE_VALUE, payload: item })}
                onSave={(id, newSetpoint) => {
                    updateLuminosity(id, newSetpoint);
                    dispatchLightModal({ type: LIGHT_ACTIONS.TOGGLE_MODAL });
                }}
                onCancel={() => dispatchLightModal({ type: LIGHT_ACTIONS.TOGGLE_MODAL })}
            />
            <View style={styles.header}>
                <Text>{connectionStatus}</Text>
            </View>
            <View style={styles.fridge}>
                <View style={styles.cardHeader}><Text style={styles.title}>Geladeira</Text></View>
                <Text>{`Nível d'água: ${data.geladeira.nivelAgua.nivel}%`}</Text>
                <FlatList
                    horizontal
                    data={data.geladeira.comidas || [{}]}
                    renderItem={({ item }) => <FridgeItem
                        id={item.id}
                        nome={item.nome}
                        quantidade={item.quantidade}
                        onPress={(item) => dispatchFoodModal({ type: FOOD_ACTIONS.TOGGLE_MODAL, payload: item })}
                    />}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <VerticalItemSeparator />}
                />
            </View>
            <View style={styles.rooms}>
                <FlatList
                    data={data.comodos || [{}]}
                    renderItem={({ item }) => <RoomItem
                        id={item.id}
                        roomData={item}
                        onPressTemperatureSetpoint={roomData => dispatchTemperatureModal({ type: TEMPERATURE_ACTIONS.TOGGLE_MODAL, payload: roomData })}
                        onPressLightSetpoint={roomData => dispatchLightModal({ type: LIGHT_ACTIONS.TOGGLE_MODAL, payload: roomData })}
                        onToggleTemperatureForRoom={(id) => toggleTemperatureRoom(id)}
                        onToggleLightForRoom={(id) => toggleLightRoom(id)}
                    />}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <HorizontalItemSeparator />}
                />
            </View>
        </View>
    );
}

interface fridgeItemProps {
    id: number;
    nome: string;
    quantidade: string;
};

const FridgeItem = ({ id, nome, quantidade, onPress }) => (
    <TouchableOpacity onPress={() => onPress({ id, nome, quantidade })}>
        <View style={fridgeStyles.block}>
            <Text style={fridgeStyles.name}>{nome}</Text>
            <Text>{quantidade}</Text>
        </View>
    </TouchableOpacity>
);

const VerticalItemSeparator = () => (
    <View style={{ width: 8 }} />
);

const fridgeStyles = StyleSheet.create({
    block: {
        borderRadius: 4,
        borderWidth: 1,
        borderStyle: "solid",
        width: 120,
        height: 75,
        justifyContent: "center",
        alignItems: "center",
    },
    name: {
        textAlign: "center",
        fontWeight: "bold"
    },
});

const RoomItem = ({
    roomData,
    onPressTemperatureSetpoint,
    onPressLightSetpoint,
    onToggleTemperatureForRoom,
    onToggleLightForRoom,
}) => (
    <View>
        <Text style={roomStyles.name}>{roomData.nome}</Text>
		<View style={roomStyles.row}>
			<View style={roomStyles.columnOne}></View>
            <View style={roomStyles.columnTwo}><Text>Medição</Text></View>
            <View style={roomStyles.columnThree}><Text>Setpoint</Text></View>
            <View style={roomStyles.columnFour}></View>
		</View>
		<View style={roomStyles.row}>
            <View style={roomStyles.columnOne}><Text>Temperatura</Text></View>
            <View style={roomStyles.columnTwo}><Text>{roomData.clima.temperatura}</Text></View>
            <View style={roomStyles.columnThree}>
                <TouchableOpacity onPress={() => onPressTemperatureSetpoint(roomData)}>
                    <Text>{roomData.clima.setpoint}</Text>
                </TouchableOpacity>
            </View>
            <View style={roomStyles.columnFour}>
                <Switch
                    value={roomData.clima.ligado}
                    onValueChange={() => onToggleTemperatureForRoom(roomData.id)}
                />
            </View>
		</View>
		<View style={roomStyles.row}>
            <View style={roomStyles.columnOne}><Text>Iluminação</Text></View>
            <View style={roomStyles.columnTwo}><Text>{roomData.iluminacao.lumens}</Text></View>
            <View style={roomStyles.columnThree}>
                <TouchableOpacity onPress={() => onPressLightSetpoint(roomData)}>
                    <Text>{roomData.iluminacao.setpoint}</Text>
                </TouchableOpacity>
            </View>
            <View style={roomStyles.columnFour}>
                <Switch
                    value={roomData.iluminacao.ligado}
                    onValueChange={() => onToggleLightForRoom(roomData.id)}
                />
            </View>
		</View>
	</View>
);

// TODO: realocar
const titleStyle = {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    paddingBottom: 12,
};

const HorizontalItemSeparator = () => (
    <View style={{ height: 8 }} />
);

const roomStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        paddingBottom: 8,
    },
    name: {
        ...titleStyle,
    },
    columnOne: {
        flex: 3,
    },
    columnTwo: {
        flex: 2,
    },
    columnThree: {
        flex: 2,
    },
    columnFour: {
        flex: 1,
    }
});

const DefaultModal = (props) => (
    <Modal transparent visible={props.visible}>
        <View style={styles.modal}>
            <View style={styles.modalWindow}>
                {props.children}
            </View>
        </View>
    </Modal>
);


const FoodModal = ({ foodModalData, onValueChange, onSave, onCancel }) => (
    <DefaultModal visible={foodModalData.visible}>
        <Text style={styles.title}>Atualizar registro de alimento na geladeira</Text>
        <TextInput
            style={styles.textInput}
            value={foodModalData.nome}
            onChangeText={newValue => onValueChange({ ...foodModalData, nome: newValue })}
        />
        <TextInput
            autofocus
            style={styles.textInput}
            value={foodModalData.quantidade}
            onChangeText={newValue => onValueChange({ ...foodModalData, quantidade: newValue })}
        />
        <Button title="Salvar" onPress={() => onSave(foodModalData)} />
        <Button title="Cancelar" onPress={onCancel} color="red" />
    </DefaultModal>
);

// TODO: TemperatureModal e LightModal podem ser um único componente mais abstrato
const TemperatureModal = ({ temperatureModalData, onValueChange, onSave, onCancel }) => (
    <DefaultModal visible={temperatureModalData.visible}>
        <Text style={styles.title}>Atualizar setpoint de temperatura</Text>
        <Text>Digite a temperatura desejada para {temperatureModalData.nome}</Text>
        <TextInput
            autofocus
            style={styles.textInput}
            value={temperatureModalData.clima.setpoint.toString()}
            onChangeText={newValue => onValueChange({ ...temperatureModalData, clima: { ...temperatureModalData.clima, setpoint: newValue }})}
        />
        <Button title="Salvar" onPress={() => onSave(temperatureModalData.id, temperatureModalData.clima.setpoint)} />
        <Button title="Cancelar" onPress={onCancel} color="red" />
    </DefaultModal>
);

const LightModal = ({ lightModalData, onValueChange, onSave, onCancel }) => (
    <DefaultModal visible={lightModalData.visible}>
        <Text style={styles.title}>Atualizar setpoint de luminosidade</Text>
        <Text>Digite a iluminância desejada para {lightModalData.nome}</Text>
        <TextInput
            autofocus
            style={styles.textInput}
            value={lightModalData.iluminacao.setpoint.toString()}
            onChangeText={newValue => onValueChange({ ...lightModalData, iluminacao: { ...lightModalData, setpoint: newValue }})}
        />
        <Button title="Salvar" onPress={() => onSave(lightModalData.id, lightModalData.iluminacao.setpoint)} />
        <Button title="Cancelar" onPress={onCancel} color="red" />
    </DefaultModal>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%",
    },
    header: {
        flex: 1,
        width: "100%",
        alignItems: "flex-end",
        paddingTop: 36,
        paddingRight: 24,
    },
    fridge: {
        flex: 4,
        width: "100%",
        paddingRight: 24,
        paddingLeft: 24,
    },
    cardHeader: {
        alignItems: "center",
    },
    title: {
        ...titleStyle,
    },
    rooms: {
        flex: 14,
        width: "100%",
        paddingRight: 24,
        paddingLeft: 24,
    },
    modal: {
        backgroundColor: "#222",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
    },
    modalWindow: {
        alignItems: "center",
        justifyContent: "space-between",
        position: "absolute",
        height: "70%",
        width: "80%",
        paddingVertical: "20%",
        backgroundColor: "white",
    },
    textInput: {
        fontSize: 18,
        width: "80%",
        marginBottom: 24,
        borderBottomWidth: 2
    }
});
