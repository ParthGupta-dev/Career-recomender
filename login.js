// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(CONFIG.firebaseConfig);
}

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const toggleQuestion = document.getElementById('toggleQuestion');
const alertBox = document.getElementById('alertBox');

let isLoginMode = true;

// Utility to show error
function showError(message) {
    alertBox.style.display = 'block';
    alertBox.innerText = message;
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

// Ensure keys are present
if (CONFIG.firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY") {
    showError("Configuration Missing: Please update config.js with your Firebase keys.");
    submitBtn.disabled = true;
}

// Toggle between Login and Sign Up
toggleAuthMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        pageTitle.innerText = "Welcome Back";
        pageSubtitle.innerText = "Login to continue creating your future.";
        submitBtn.innerText = "Login";
        toggleQuestion.innerText = "New here?";
        toggleAuthMode.innerText = "Create an Account";
    } else {
        pageTitle.innerText = "Create Account";
        pageSubtitle.innerText = "Start your journey today.";
        submitBtn.innerText = "Sign Up";
        toggleQuestion.innerText = "Already have an account?";
        toggleAuthMode.innerText = "Login";
    }
});

// Handle Form Submit
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    if (isLoginMode) {
        // Login
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.error("Firebase Login Error:", error);

                if (error.code === 'auth/user-not-found') {
                    showError("Account not found. Please click 'Create an Account' below.");
                } else if (error.code === 'auth/wrong-password') {
                    showError("Incorrect password.");
                } else if (error.code === 'auth/project-not-found') {
                    showError("Start Error: Project not found. \n\nCHECK THE URL in your Firebase Console!\nIt should look like: console.firebase.google.com/project/[YOUR-ID]/...\nThe part after 'project/' is your REAL ID.");
                } else {
                    showError(`${error.code}: ${error.message}`);
                }

                submitBtn.innerText = "Login";
                submitBtn.disabled = false;
            });
    } else {
        // Sign Up
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.error("Firebase Error:", error);
                // Show more detailed error
                showError(`${error.code}: ${error.message}`);
                submitBtn.innerText = isLoginMode ? "Login" : "Sign Up";
                submitBtn.disabled = false;
            });
    }
});

// Debug Logging
console.log("Loaded Configuration:", CONFIG.firebaseConfig);
