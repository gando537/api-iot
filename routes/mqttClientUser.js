const mqtt = require('mqtt');
const mqttClientUser = mqtt.connect('mqtt://mqtt.eclipseprojects.io');
import { users } from '../services/services';

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

module.exports = mqttClientUser;