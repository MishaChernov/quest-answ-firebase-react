const { admin, db } = require('./admin');

module.exports = (req, res, next) => {
    let idToken;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found');
        return res.status(403).json({ error: 'Unauthorized' });
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
            req.user.userHandle = data.docs[0].data().userHandle;
            req.user.userPhoto = data.docs[0].data().userPhoto;
            req.user.userName = data.docs[0].data().userName;

            return next();
        })
        .catch((err) => {
            console.error('Error while verifying token, ', err);
            return res.status(400).json(err);
        });
};
