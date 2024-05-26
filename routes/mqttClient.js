const mqtt = require('mqtt');

const pools = [];

const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');

// Suscribe au topic /uca/iot/piscine pour récupérer la liste des piscines
mqttClient.on('connect', () => {
    mqttClient.subscribe('uca/iot/piscine', (err) => {
        if (err) {
            console.error('MQTT subscription error:', err);
        } else {
            console.log('MQTT subscribed to uca/iot/piscine');
        }
    });
});

mqttClient.on('message', (topic, message) => {
    const jsonMessage = JSON.parse(message.toString());
    //console.log('Received MQTT message:', jsonMessage);

    const ident = jsonMessage.info.ident;
    let temperature;
    temperature = jsonMessage.status.temperature;
    const lat = jsonMessage.location.gps.lat;
    const lon = jsonMessage.location.gps.lon;
    let color = "battery-full";
    if (jsonMessage.hasOwnProperty("piscine")) {
        if (jsonMessage.piscine.occuped === false) {
            color = "battery-empty";
        }
    }

    const existingItemIndex = pools.findIndex(item => item.ident === ident);
    if (existingItemIndex !== -1) {
        pools[existingItemIndex] = { ident, temperature, lat, lon, color };
        console.log('Ident updated:', ident);
    } else {
        pools.push({ ident, temperature, lat, lon, color });
        console.log('New ident added:', ident);
    }
    console.log('Pools:', pools);
});

module.exports = { mqttClient, pools }