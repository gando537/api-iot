var path = require('path');
var index = require('./routes/index');

const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 80;

const mqtt = require('mqtt');
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');
const mqttClientUser = mqtt.connect('mqtt://mqtt.eclipseprojects.io');
const mqttClientControlESP = mqtt.connect('mqtt://mqtt.eclipseprojects.io');

app.use(express.json());

// Express MVC ---------------------------------------------------------------------

// Configurer EJS comme moteur de template
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Utiliser le routeur défini dans 'routes/index.js'
app.use('/', index);

// Requests ---------------------------------------------------------------------
// POST, Insert dans la base de données
app.post('/insert', async (req, res) => {
  console.log("insert");
  try {
    const client = await MongoClient.connect('mongodb+srv://MIAGE-IOT_DEV:TP_IOT_MDP_CLUSTER@cluster0.8dbefzy.mongodb.net/?retryWrites=true&w=majority');
    const db = client.db('WaterBnB');

    const collection = db.collection('request');
    const result = await collection.insertOne(req.body);

    client.close();

    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET, Récupère les données de la base de données
app.get('/get', async (req, res) => {
  try {
    const client = await MongoClient.connect('mongodb+srv://MIAGE-IOT_DEV:TP_IOT_MDP_CLUSTER@cluster0.8dbefzy.mongodb.net/?retryWrites=true&w=majority');
    const db = client.db('WaterBnB');

    const collection = db.collection('request');
    const documents = await collection.find().toArray();

    client.close();

    res.status(200).json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// MQTT ---------------------------------------------------------------------
const pools = [];
const users = [];

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
  if(jsonMessage.status.temperature != null) {
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

// GET, Retourne la liste des piscines
app.get('/pools', async (req, res) => {
  try {
    res.status(200).json(pools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET, Retourne la liste des utilisateurs
app.get('/users', async (req, res) => {
  try {
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET, Ouvre le porte
app.get('/open', async (req, res) => {
  try {
    const espIdent = req.query.espIdent;
    const idEtudiant = req.query.idEtudiant;
    // current timestamp in milliseconds
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    // prints date & time in YYYY-MM-DD format
    let date_full = year + "-" + month + "-" + date;

    console.log('MQTT PREPARE SEND OPEN to uca/iot/open/' + espIdent);
    mqttClientControlESP.publish('uca/iot/open/' + espIdent, '{"openDoor": "yes", "idEtudiant" : ' + idEtudiant + ', "date" : "' + date_full + '"}');
    console.log('MQTT SEND OPEN to uca/iot/open/' + espIdent);
    res.status(200).json("{message: 'Envoi d'ouverture effectue', espconcerne: '" + espIdent + "', topicconcerne: 'uca/iot/open/" + espIdent + ', "date" : ' + date_full + "'}");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error'});
  }
});


// Lancement du serveur ---------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});