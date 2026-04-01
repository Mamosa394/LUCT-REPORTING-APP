// backend/src/firebase-admin.js
const admin = require('firebase-admin');
const config = require('./config');

// Initialize Firebase Admin SDK directly with config
const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebaseAdminConfig.projectId,
          privateKey: config.firebaseAdminConfig.privateKey,
          clientEmail: config.firebaseAdminConfig.clientEmail,
        }),
        databaseURL: config.firebaseAdminConfig.databaseURL,
      });
      
      console.log(' Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error(' Firebase Admin initialization error:', error);
      throw error;
    }
  }
  
  return admin;
};

module.exports = {
  initializeFirebaseAdmin,
  admin,
};