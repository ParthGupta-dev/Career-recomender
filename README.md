# Career Recommender 🚀

An AI-powered career recommendation system that helps students discover career paths based on their interests. Built with vanilla JavaScript and powered by Google's Gemini AI.

## ✨ Features

- **AI Career Recommendations** - Get personalized career suggestions based on your interests
- **Career Cards Gallery** - Beautiful card-based UI with glassmorphism design
- **Market Demand Analysis** - See job market trends and growth predictions for each career
- **Career Roadmap Generator** - Get a step-by-step plan from your current position to your dream career
- **Share Your Results** - Share on Twitter, LinkedIn, WhatsApp, or download as PDF
- **User Authentication** - Firebase authentication for personalized experience
- **Secure API** - API keys protected via Vercel serverless functions

## 🌐 Live Demo

Deploy your own with [Vercel](https://vercel.com) — see deployment instructions below.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **AI:** Google Gemini API
- **Authentication:** Firebase Auth
- **Backend:** Vercel Serverless Functions
- **Deployment:** Vercel
- **PDF Generation:** jsPDF
- **Markdown Rendering:** Marked.js
- **Icons:** Font Awesome

## 📦 Installation & Local Development

### Prerequisites
- A Google Gemini API key ([Get one here](https://aistudio.google.com))
- Firebase project ([Create one here](https://console.firebase.google.com))

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Career-recomender
   ```

2. **Configure Firebase**
   - Update `config.js` with your Firebase configuration

3. **Set up environment variables**
   - Create a `.env.local` file in the root directory:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. **Open locally**
   - Simply open `index.html` in your browser for frontend testing
   - For testing serverless functions, use Vercel CLI:
     ```bash
     npm install -g vercel
     vercel dev
     ```

## 🚀 Deploy to Vercel

### Method 1: Via Vercel Dashboard (Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project" → Import your repository
4. Vercel will auto-detect settings
5. **Add Environment Variable:**
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
6. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`! 🎉

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

### Setting Environment Variables on Vercel

After deployment:
1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add: `GEMINI_API_KEY` with your API key
4. Redeploy for changes to take effect

## 📁 Project Structure

```
Career-recomender/
├── api/                    # Vercel serverless functions
│   ├── gemini.js          # Career recommendations endpoint
│   └── roadmap.js         # Roadmap generation endpoint
├── index.html             # Main HTML file
├── style.css              # Styles with glassmorphism effects
├── script.js              # Frontend logic
├── config.js              # Firebase configuration
├── auth.js                # Authentication logic
├── login.html             # Login page
├── login.js               # Login page logic
├── vercel.json            # Vercel configuration
├── .env.local             # Local environment variables (not committed)
└── .gitignore             # Git ignore file
```

## 🔐 Security

- API keys are stored securely in environment variables
- Serverless functions prevent client-side API key exposure
- Firebase security rules protect user data
- HTTPS enabled by default on Vercel

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Created with ❤️ by Vedant

---

**Note:** This is a learning project. The AI suggestions are for informational purposes only and should not be considered professional career advice.