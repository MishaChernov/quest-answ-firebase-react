const { admin, db } = require('../util/admin');

const config = require('../util/config');
const { uuid } = require('uuidv4');

const firebase = require('firebase');
firebase.initializeApp(config);

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email.match(regEx);
};

const isEmpty = (string) => string.trim() === '';

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    let errors = {};

    if (isEmpty(req.body.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(req.body.email)) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(req.body.password)) {
        errors.password = 'Must not be empty';
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
