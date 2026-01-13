// Track input
const interestInput = document.getElementById('interestInput');
const wordCountDisplay = document.getElementById('wordCount');
const resultHeader = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const recommendBtn = document.getElementById('recommendBtn');

// Word Count Logic
interestInput.addEventListener('input', () => {
    const text = interestInput.value.trim();
    // Split by spaces, filter out empty strings to count real words
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const count = words.length;

    wordCountDisplay.innerText = `${count} / 15 words`;

    if (count > 15) {
        wordCountDisplay.style.color = '#ff4d4d'; // Red warning
        recommendBtn.disabled = true;
        recommendBtn.style.opacity = '0.5';
        recommendBtn.innerText = "Too many words!";
    } else {
        wordCountDisplay.style.color = '#eee';
        recommendBtn.disabled = false;
        recommendBtn.style.opacity = '1';
        recommendBtn.innerText = "Get AI Recommendation";
    }
});

recommendBtn.addEventListener('click', async () => {
    const interests = interestInput.value.trim();

    if (!interests) {
        resultHeader.innerText = "Please write something about yourself!";
        return;
    }

    // Check if API key is set
    if (CONFIG.geminiApiKey === "YOUR_GEMINI_API_KEY") {
        resultHeader.innerHTML = "Error: API Key missing. Please update <code>config.js</code>.";
        return;
    }

    // Show Loading
    loadingDiv.classList.remove('hidden');
    resultHeader.innerText = "";
    recommendBtn.disabled = true;

    try {
        const responseText = await callGemini(interests);

        // Convert Markdown to HTML using 'marked' library
        resultHeader.innerHTML = marked.parse(responseText);

        // EXTRACTION LOGIC: Finds text inside bold **Title** inside the table
        // Matches "**Software Engineer**"
        const careerMatches = responseText.match(/\*\*(.*?)\*\*/g);

        const targetSelect = document.getElementById('targetCareer');
        targetSelect.innerHTML = '<option value="" disabled selected>-- Select a Career --</option>';

        if (careerMatches) {
            // Filter out the header if it happens to be bolded (though prompt says Career Path is col header)
            const uniqueCareers = [...new Set(careerMatches)]; // Remove duplicates

            uniqueCareers.forEach(career => {
                // Remove asterisks
                let cleanCareer = career.replace(/\*\*/g, '');
                // Ignore if it looks like a header (e.g. contains "Career Path")
                if (cleanCareer.toLowerCase().includes('career path')) return;

                const option = document.createElement('option');
                option.value = cleanCareer;
                option.innerText = cleanCareer;
                targetSelect.appendChild(option);
            });
        } else {
            // Fallback if AI formatting changes
            targetSelect.innerHTML += '<option value="Custom">Type it manually above</option>';
        }

        // Show the Roadmap Section now that we have a result
        document.getElementById('roadmapSection').classList.remove('hidden');
    } catch (error) {
        console.error("Full Error Object:", error);
        resultHeader.innerHTML = `<span style="color: red; font-size: 1rem;">Error: ${error.message}</span><br><small style="color: #ccc;">Check console (F12) for details.</small>`;
    } finally {
        loadingDiv.classList.add('hidden');
        recommendBtn.disabled = false;
    }
});

async function callGemini(interests) {
    const prompt = `I am a student interested in: ${interests}. 
    Suggest 3 specific career paths for me. 
    Format the output as a simple Markdown Table with two columns: "Career Path" and "Why it fits".
    Do not add Numbering.
    Make sure the Career Path is Bolded (e.g., **Software Engineer**).`;

    // Use 'gemini-flash-latest' which is often the most compatible free-tier model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${CONFIG.geminiApiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error details:", errorData);
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// ROADMAP LOGIC
const roadmapBtn = document.getElementById('roadmapBtn');
const roadmapResult = document.getElementById('roadmapResult');
const roadmapLoading = document.getElementById('roadmapLoading');
const roadmapSection = document.getElementById('roadmapSection');

roadmapBtn.addEventListener('click', async () => {
    const current = document.getElementById('currentPosition').value;
    const target = document.getElementById('targetCareer').value;

    if (!current || !target) {
        alert("Please fill in both Current Status and Goal Career.");
        return;
    }

    roadmapLoading.classList.remove('hidden');
    roadmapResult.innerHTML = "";
    roadmapBtn.disabled = true;

    const prompt = `Create a specific, simple 5-step roadmap for someone who is currently a "${current}" and wants to become a "${target}".
    For each step:
    1. Give a bold title (e.g., **Step 1: Learn Basics**).
    2. One sentence of advice.
    Format as a Markdown list.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${CONFIG.geminiApiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        roadmapResult.innerHTML = marked.parse(text);

        // Add Payment Request
        roadmapResult.innerHTML += `
            <div style="margin-top: 30px; padding: 20px; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 15px; text-align: center;">
                <h3 style="color: #ffd700; margin-bottom: 10px;">💎 Unlock Complete Mentorship</h3>
                <p style="margin-bottom: 15px;">Get detailed resources, contact info for mentors, and a certification for this path.</p>
                <button style="background: #ffd700; color: #333; border: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: transform 0.2s;">
                    Pay ₹1500/-
                </button>
            </div>
        `;
    } catch (e) {
        console.error(e);
        roadmapResult.innerHTML = "Error generating roadmap. Try again.";
    } finally {
        roadmapLoading.classList.add('hidden');
        roadmapBtn.disabled = false;
    }
});
