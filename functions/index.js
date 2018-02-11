const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const store = admin.firestore();

exports.makeUser = functions.auth.user().onCreate(event => {
  const user = event.data;
  const { email, photoURL = '', displayName, uid } = user;
  return store
    .collection('/users')
    .doc(uid)
    .create({
      email,
      photoURL,
      displayName
    })
    .catch(err => {
      console.error(err);
    });
});

exports.generateFeed = functions.firestore
  .document('posts/{postId}')
  .onCreate(event => {
    const data = event.data.data();
    const pid = event.data.id;
    return store
      .collection('users')
      .doc(data.authorId)
      .get()
      .then(doc => {
        if (doc.exists) {
          const data2 = doc.data();
          const followers = data2.followers;
          console.log(followers);
          if (followers.length) {
            for (let follower of followers) {
              store
                .collection('users')
                .doc(follower)
                .collection('feed')
                .doc(pid)
                .create({});
            }
          }
        }
        return doc;
      })
      .catch(err => {
        console.error(err);
      });
  });
