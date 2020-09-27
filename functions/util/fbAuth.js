const { admin, db } = require('../util/admin');

module.exports = (req, res, next) => {
    let idToken;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWIth('Bearer ')
    ) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('Token has not found');
        res.status(403).json({ error: 'Unauthorized' });
    }

    admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
            req.user = decodedToken;
            console.log(decodedToken);

            return db
                .collection('users')
                .where('uid', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then((data) => {
            req.user.handle = data.docs(0).data().handle;
            return next();
        })
        .catch((err) => {
            console.error('Error while verifying token, ', err);
            res.status(400).json(err);
        });
};