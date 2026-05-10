// This is an example configuration file.
// Copy this file to 'config.js' and fill in your actual API keys.
// 'config.js' is ignored by Git to keep your secrets safe.

const CONFIG = {
    // 1. Go to console.firebase.google.com
    // 2. Create a project -> Add App (Web) -> Copy the config object below
    firebaseConfig: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    },

    // Note: Gemini API Key should be handled via serverless functions (like in /api folder)
    // or placed in .env.local for local development.
};
