const { admin, db } = require('../util/admin');

const config = require('../util/config');
const { uuid } = require('uuidv4');

const firebase = require('firebase');
firebase.initializeApp(config);

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };
    let errors = {};
    if (req.body.email.trim() === '') {
        errors.email = 'Must not be empty ';
    }

    if (req.body.password.trim() === '') {
        errors.password = 'Must not be empty ';
    }

    if (Object.keys(errors).length > 0) res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({ token });
        })
        .catch((err) => {
            console.error(err);
            return res
                .status(403)
                .json({ general: 'Wrong credentials, please try again' });
        });
};
