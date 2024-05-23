var path = require('path');
var index = require('./routes/index');
var router = require('./routes/routes');
var mqttClient = require('./routes/mqtt');
var mqttClientUser = require('./routes/mqtt');
const express = require('express');

const app = express();
const port = 80;

app.use(express.json());

// Express MVC ---------------------------------------------------------------------

// Configurer EJS comme moteur de template
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Utiliser les routes
app.use('/', index);
app.use('/routes', router);
app.use('/routes', mqttClient);
app.use('/routes', mqttClientUser);

// Lancement du serveur ---------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
