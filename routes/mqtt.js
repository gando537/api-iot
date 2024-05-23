var express = require('express');
var router = express.Router();

const mqtt = require('mqtt');
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');
const mqttClientUser = mqtt.connect('mqtt://mqtt.eclipseprojects.io');
const mqttClientControlESP = mqtt.connect('mqtt://mqtt.eclipseprojects.io');

const pools = [];
const users = [];

// MQTT ---------------------------------------------------------------------

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
    if (jsonMessage.status.temperature != null) {
        temperature = jsonMessage.status.temperature;
    } else {
        temperature = jsonMessage.temperature;
    }
    const lat = jsonMessage.info.loc.lat;
    const lon = jsonMessage.info.loc.lon;
    let color = "battery-full";
    if (jsonMessage.hasOwnProperty("piscine")) {
        color = jsonMessage.piscine.led;
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

// Suscribe au topic /uca/waterbnb/# pour récupérer la liste des utilisateurs
mqttClientUser.on('connect', () => {
    mqttClientUser.subscribe('uca/waterbnb/#', (err) => {
        if (err) {
            console.error('MQTT subscription error:', err);
        } else {
            console.log('MQTT subscribed to uca/waterbnb/#');
        }
    });
});

mqttClientUser.on('message', (topic, message) => {
    const jsonMessage = JSON.parse(message.toString());

    const tid = jsonMessage.tid;
    const lat = jsonMessage.lat;
    const lon = jsonMessage.lon;

    const existingItemIndex = users.findIndex(item => item.tid === tid);
    if (existingItemIndex !== -1) {
        users[existingItemIndex] = { tid, lat, lon };
        console.log('Ident updated:', tid);
    } else {
        users.push({ tid, lat, lon });
        console.log('New ident added:', tid);
    }
    console.log('Users:', users);
});

module.exports = { router, pools, users, mqttClientControlESP, mqttClient, mqttClientUser};