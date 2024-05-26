var express = require('express');
var router = express.Router();
const { MongoClient } = require('mongodb');
const { users } = require('./mqttClientUser');
const { pools } = require('./mqttClient');

const mqtt = require('mqtt');
const mqttClientControlESP = mqtt.connect('mqtt://mqtt.eclipseprojects.io');

const url = 'mongodb+srv://gandohd:cdatltrnwbrTGCP9@cluster1.dupmfaf.mongodb.net/?retryWrites=true&w=majority';

function getdb(collection) {
    const client = MongoClient.connect(url);
    const db = client.db('WaterBnB');
    const collection = db.collection(collection);
    return collection;
}
// Requests ---------------------------------------------------------------------
// POST, Insert dans la base de données
router.post('/insert', async (req, res) => {
    console.log("insert");
    try {
        const collection = getdb('access');
        const result = await collection.insertOne(req.body);

        client.close();

        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET, Récupère les données de la base de données
router.get('/get', async (req, res) => {
    try {
        const collection = getdb('access');
        const documents = await collection.find().toArray();

        client.close();

        res.status(200).json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET, Retourne la liste des piscines
router.get('/pools', async (req, res) => {
    try {
        res.status(200).json(pools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET, Retourne la liste des utilisateurs
router.get('/users', async (req, res) => {
    try {
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET, Ouvre le porte
router.get('/open', async (req, res) => {
    try {
        const idu = req.query.idu;
        const idswp = req.query.idswp;
        // current timestamp in milliseconds
        let ts = Date.now();
        let granted;

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();

        // prints date & time in YYYY-MM-DD format
        let date_full = year + "-" + month + "-" + date;

        const collection = getdb('users');
        if (await collection.findOne({ idu: idu }) !== null) {
            console.log('MQTT PREPARE SEND OPEN to uca/iot/open/' + idswp);
            mqttClientControlESP.publish('uca/iot/open/' + idswp, '{"openDoor": "yes", "idu" : ' + idu + ', "date" : "' + date_full + '"}');
            console.log('MQTT SEND OPEN to uca/iot/open/' + idswp);
            res.status(200).json("{message: 'Envoi d'ouverture effectue', espconcerne: '" + idswp + "', topicconcerne: 'uca/iot/open/" + idswp + ', "date" : ' + date_full + "'}");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/publish', async (req, res) => {
    try {
        const request_data = req.query;
        const topic = request_data.topic;
        const message = request_data.message;
        mqttClientControlESP.publish(topic, message);
        res.status(200).json({ message: 'Message published' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;