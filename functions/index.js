const functions = require('firebase-functions');
const app = require('express')();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const FBAuth = require('./util/fbAuth');
const { login, signup } = require('./handlers/users');
const {
    getAllQuestions,
    createQuestion,
    getQuestion,
    deleteQuestion,
} = require('./handlers/questions');

const port = process.env.PORT || 5000;

// Extended https://swagger.io/specification/#info-object
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Quest-Answ API',
            description: 'Some API Information',
            contact: {
                name: 'Amazing Developer'
            },
            servers: ['http://localhost:5000']
        }
    },
    apis: ['index.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// users routes
app.post('/login', login);
app.post('/signup', signup);

// questions routes
app.get('/questions', getAllQuestions);
app.get('/question/:questionId', getQuestion);
app.delete('/question/:questionId', FBAuth, deleteQuestion);
app.post('/question', FBAuth, createQuestion);

app.listen(port, () => {
    console.log('Server listening on http://localhost:5000');
});

exports.api = functions.region('europe-west1').https.onRequest(app);
