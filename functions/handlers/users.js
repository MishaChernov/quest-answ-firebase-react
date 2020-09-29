const { admin, db } = require('../util/admin');

const config = require('../util/config');
const { uuid } = require('uuidv4');

const firebase = require('firebase');
firebase.initializeApp(config);

const isEmail = (email) => {
    // eslint-disable-next-line no-useless-escape
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

exports.signup = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userHandle: req.body.userHandle
    };

    let errors = {};

    if (isEmpty(user.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(user.email)) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(user.password)) {
        errors.password = 'Must not be empty';
    }

    if (isEmpty(user.confirmPassword)) {
        errors.confirmPassword = 'Must not be empty';
    } else if (user.password !== user.confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    if (isEmpty(user.userHandle)) {
        errors.userHandle = 'Must not be empty';
    }

    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    let userId, token;

    db.doc(`/users/${user.userHandle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res
                    .status(400)
                    .json({ handle: 'This handle is already taken' });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(user.email, user.password);
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((tokenId) => {
            token = tokenId;

            const userCredentials = {
                uid: userId,
                email: user.email,
                userPhoto: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/no-img.png?alt=media`,
                userHandle: user.userHandle,
                userName: 'Somename',
                createdAt: new Date().toISOString(),
            };

            return db.doc(`/users/${user.userHandle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(200).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res
                    .status(400)
                    .json({ email: 'Email is already is use' });
            } else {
                return res.status(500).json({
                    general: 'Something went wrong, please try again',
                });
            }
        });
    
    // eslint-disable-next-line consistent-return
    return;
};
