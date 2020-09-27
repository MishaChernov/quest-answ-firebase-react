const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const { login, signup } = require('./handlers/users');

// users routes
app.post('/login', login);
app.post('/signup', signup);

exports.api = functions.region('europe-west1').https.onRequest(app);
