var express = require('express');
var router = express.Router();
const { MongoClient } = require('mongodb');
const { users } = require('./mqttClientUser');
const { pools } = require('./mqttClient');

const mqtt = require('mqtt');
const mqttClientControlESP = mqtt.connect('mqtt://mqtt.eclipseprojects.io');

// const url = 'mongodb+srv://gandohd:cdatltrnwbrTGCP9@cluster1.dupmfaf.mongodb.net/?retryWrites=true&w=majority';
const url = 'mongodb+srv://MIAGE-IOT_DEV:TP_IOT_MDP_CLUSTER@cluster0.8dbefzy.mongodb.net/?retryWrites=true&w=majority';
// Requests ---------------------------------------------------------------------
// POST, Insert dans la base de données
router.post('/insert', async (req, res) => {
    console.log("insert");
    try {
        const client = await MongoClient.connect(url);
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
router.get('/get', async (req, res) => {
    try {
        const client = await MongoClient.connect(url);
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
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;