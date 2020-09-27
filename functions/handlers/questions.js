const { admin, db } = require('../util/admin');

const isEmpty = (string) => string.trim() === '';

exports.getAllQuestions = (req, res) => {
    db.collection('questions')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let questions = [];

            data.forEach((doc) => {
                questions.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    authorName: doc.data().authorName,
                    authorUsername: doc.data().authorUsername,
                    authorPhoto: doc.data().authorPhoto,
                    likesCount: doc.data().likesCount,
                    commentsCount: doc.data().commentsCount,
                });
            });

            return res.json(questions);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json('Questions not found, ', err);
        });
};
