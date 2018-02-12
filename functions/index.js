require('dotenv').config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');
const ALGOLIA_ID = process.env.ALGOLIA_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY;

const ALGOLIA_INDEX_NAME = 'users';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

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
    .then(() => {
      const index = client.initIndex(ALGOLIA_INDEX_NAME);
      return index.saveObject({
        email,
        photoURL,
        displayName,
        objectID: uid
      });
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
