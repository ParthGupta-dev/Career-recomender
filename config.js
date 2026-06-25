// KEEP THIS FILE SAFE!
// Ideally, in production, you wouldn't expose keys like this on the client-side without restrictions.

const CONFIG = {
    // 1. Go to console.firebase.google.com
    // 2. Create a project -> Add App (Web) -> Copy the config object below
    firebaseConfig: {
        apiKey: "AIzaSyD78N9Vmp3kvQb0tpnqCo_vcNVQv7_U_H4",
        authDomain: "career-recem.firebaseapp.com",
        projectId: "career-recem",
        storageBucket: "career-recem.firebasestorage.app",
        messagingSenderId: "704278576754",
        appId: "1:704278576754:web:76f7ec90f621084cc04ceb"
    },

    // Gemini API Key is now securely stored on the server
    // The API calls are made through Vercel serverless functions at /api/gemini and /api/roadmap
    // This prevents the API key from being exposed in the browser
};

// Export for use in other files if using modules, but for vanilla JS script tags,
// this object will just be available globally if loaded first.