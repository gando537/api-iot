var express = require('express');
var router = express.Router();
const { MongoClient } = require('mongodb');
const { users, pools } = require('./mqtt');

const url = 'mongodb+srv://gandohd:cdatltrnwbrTGCP9@cluster1.dupmfaf.mongodb.net/?retryWrites=true&w=majority';

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

module.exports = { router, pools, users };