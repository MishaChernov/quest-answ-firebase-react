const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const { login, signup } = require('./handlers/users');
const { getAllQuestions } = require('./handlers/questions');

// users routes
app.post('/login', login);
app.post('/signup', signup);

// questions routes
app.get('/questions', getAllQuestions);

exports.api = functions.region('europe-west1').https.onRequest(app);
