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
                    authorHandle: doc.data().authorHandle,
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

exports.createQuestion = (req, res) => {
    if (isEmpty(req.body.body)) {
        return res.status(400).json({ body: 'Body must not be empty' });
    }

    const question = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        authorName: req.user.userName,
        authorHandle: req.user.userHandle,
        authorPhoto: req.user.userPhoto,
        likesCount: 0,
        commentsCount: 0,
    };

    db.collection('questions')
        .add(question)
        .then((doc) => {
            const resQuestion = question;
            resQuestion.questionId = doc.id;
            return res.status(200).json(resQuestion);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json('Can not create question');
        });

    // eslint-disable-next-line consistent-return
    return;
};

exports.getQuestion = (req, res) => {
    db.doc(`/questions/${req.params.questionId}`)
        .get()
        .then((doc) => {
            if (!doc.exists)
                return res
                    .status(404)
                    .json({ error: 'Question was not found' });

            let question = doc.data();

            //TODO: Get comments for this post and push to the response

            return res.status(200).json(question);
        })
        .catch((err) => {
            console.error(err);
            return res.status(404).json({ error: 'Question not found' });
        });

    // eslint-disable-next-line consistent-return
    return;
};
