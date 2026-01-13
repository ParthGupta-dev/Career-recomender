// Initialize Firebase (Check if already initialized to avoid errors)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(CONFIG.firebaseConfig);
} else if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded. Make sure to include the script tags.");
}

// Function to check auth state
function checkAuth() {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            // User is signed out, redirect to login
            // But don't redirect if we are already on login page (simple check)
            if (!window.location.href.includes('login.html')) {
                window.location.href = "login.html";
            }
        } else {
            console.log("User is logged in:", user.email);
        }
    });
}

// Function to logout
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}

// Run check on load
// We need to wait a tiny bit for Firebase to initialize fully sometimes, 
// but onAuthStateChanged handles the initial state correctly.
if (!window.location.href.includes('login.html')) {
    checkAuth();
}
