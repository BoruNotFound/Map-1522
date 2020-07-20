const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.newUserRecord = functions.auth.user().onCreate(user => {
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        loginCount: 0,
        name: "",
        country: "",
        country_name: "",
        state: "",
        city: "",
        bio: "",
        id: user.uid,
        profilePicURL: "profile_pictures/default_profile.png"
    });
});

exports.deleteUserRecord = functions.auth.user().onDelete(user => {
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});

exports.updateUserRecord = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Please log in first :)'
        );
    }

    // Check properties
    if (data.name.length > 16) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Your name is too long.'
        );
    }

    if (data.name.length === 0) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Please type in your name.'
        );
    }

    if (data.country === "None") {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Please select your country.'
        );
    }

    if ((data.state === "None") && (data.country === "id228" || data.country === "id41")) {
        // must select state when the country is US / China
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Please select your state/ province.'
        );
    }

    if (data.city.length === 0) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Please type in your city.'
        );
    } else if (data.city.length > 30) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'City names cannot be longer than 30 characters.'
        );
    }

    var userDoc = admin.firestore().collection('users').doc(context.auth.uid);
    
    return userDoc.set({
        name: data.name,
        bio: data.bio,
        country: data.country,
        country_name: data.country_name,
        state: data.state,
        city: data.city,
    }, {merge: true});
});

exports.incrementLoginCount = functions.https.onCall((data, context) => {
    var userDoc = admin.firestore().collection('users').doc(context.auth.uid);
    
    return userDoc.set({
        loginCount: 1
    }, {merge: true});
});

exports.updateProfileURL = functions.https.onCall((data, context) => {
    var userDoc = admin.firestore().collection('users').doc(context.auth.uid);
    return userDoc.set({
        profilePicURL: data.profileURL
    }, {merge: true});
});