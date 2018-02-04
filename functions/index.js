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
