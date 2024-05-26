const mqtt = require('mqtt');
const mqttClientUser = mqtt.connect('mqtt://mqtt.eclipseprojects.io');
const users = [];

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

    const idu = jsonMessage.idu;
    const lat = jsonMessage.lat;
    const lon = jsonMessage.lon;

    const existingItemIndex = users.findIndex(item => item.idu === idu);
    if (existingItemIndex !== -1) {
        users[existingItemIndex] = { idu, lat, lon };
        console.log('Ident updated:', idu);
    } else {
        users.push({ tid, lat, lon });
        console.log('New ident added:', idu);
    }
    console.log('Users:', users);
});

module.exports = { mqttClientUser, users}