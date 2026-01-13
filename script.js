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

    // Show Loading
    loadingDiv.classList.remove('hidden');
    resultHeader.innerText = "";
    recommendBtn.disabled = true;

    // Hide cards and share buttons initially
    document.getElementById('careerCardsContainer').classList.add('hidden');
    document.getElementById('shareButtons').classList.add('hidden');

    try {
        const responseText = await callGemini(interests);

        // Parse JSON response
        let careerData;
        try {
            // Extract JSON from markdown code blocks if present
            let jsonText = responseText;
            if (responseText.includes('```json')) {
                jsonText = responseText.split('```json')[1].split('```')[0].trim();
            } else if (responseText.includes('```')) {
                jsonText = responseText.split('```')[1].split('```')[0].trim();
            }

            careerData = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.log("Raw Response:", responseText);
            throw new Error("Failed to parse AI response. Please try again.");
        }

        // Store career data globally for sharing
        window.currentCareers = careerData.careers;
        window.currentInterests = interests;

        // Render career cards
        renderCareerCards(careerData.careers);

        // Show success message
        resultHeader.innerHTML = "✨ <strong>Your Personalized Career Recommendations:</strong>";

        // Populate dropdown for roadmap
        const targetSelect = document.getElementById('targetCareer');
        targetSelect.innerHTML = '<option value="" disabled selected>-- Select a Career --</option>';

        careerData.careers.forEach(career => {
            const option = document.createElement('option');
            option.value = career.name;
            option.innerText = career.name;
            targetSelect.appendChild(option);
        });

        // Show the Roadmap Section
        document.getElementById('roadmapSection').classList.remove('hidden');

        // Show share buttons
        document.getElementById('shareButtons').classList.remove('hidden');

    } catch (error) {
        console.error("Full Error Object:", error);

        // Handle Rate Limit / Quota Errors
        if (error.message.includes('Quota exceeded') || error.message.includes('429')) {
            resultHeader.innerHTML = `
                <div style="padding: 20px; background: rgba(255, 165, 0, 0.1); border: 1px solid #FFA500; border-radius: 10px; color: #FFA500;">
                    <i class="fas fa-hourglass-half" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
                    <strong>AI is busy!</strong><br>
                    We hit the free usage limit. Please wait about <strong>60 seconds</strong> before trying again.
                </div>
            `;
        } else {
            resultHeader.innerHTML = `<span style="color: red; font-size: 1rem;">Error: ${error.message}</span><br><small style="color: #ccc;">Check console (F12) for details.</small>`;
        }
    } finally {
        loadingDiv.classList.add('hidden');
        recommendBtn.disabled = false;
    }
});

async function callGemini(interests) {
    // Call our serverless function instead of Gemini directly
    // This keeps the API key secure on the server
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interests })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.response;
}

// Helper function to get icon for career
function getCareerIcon(careerName) {
    const name = careerName.toLowerCase();

    if (name.includes('software') || name.includes('developer') || name.includes('programmer')) {
        return 'fa-code';
    } else if (name.includes('data') || name.includes('analyst')) {
        return 'fa-chart-line';
    } else if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
        return 'fa-palette';
    } else if (name.includes('doctor') || name.includes('medical') || name.includes('health')) {
        return 'fa-user-md';
    } else if (name.includes('teacher') || name.includes('education')) {
        return 'fa-chalkboard-teacher';
    } else if (name.includes('business') || name.includes('manager')) {
        return 'fa-briefcase';
    } else if (name.includes('engineer')) {
        return 'fa-cogs';
    } else if (name.includes('artist') || name.includes('creative')) {
        return 'fa-paint-brush';
    } else if (name.includes('writer') || name.includes('content')) {
        return 'fa-pen-fancy';
    } else if (name.includes('market')) {
        return 'fa-bullhorn';
    } else if (name.includes('finance') || name.includes('account')) {
        return 'fa-dollar-sign';
    } else {
        return 'fa-star'; // Default icon
    }
}

// Helper function to get trend emoji and class
function getTrendBadge(trend) {
    const trendLower = trend.toLowerCase();

    if (trendLower.includes('hot')) {
        return { emoji: '🔥', text: 'Hot Career', class: 'demand-high' };
    } else if (trendLower.includes('growing')) {
        return { emoji: '📈', text: 'Growing', class: 'demand-medium' };
    } else if (trendLower.includes('stable')) {
        return { emoji: '💼', text: 'Stable', class: 'demand-medium' };
    } else {
        return { emoji: '📉', text: 'Declining', class: 'demand-low' };
    }
}

// Render career cards
function renderCareerCards(careers) {
    const container = document.getElementById('careerCardsContainer');
    container.innerHTML = ''; // Clear existing content

    careers.forEach(career => {
        const card = document.createElement('div');
        card.className = 'career-card';

        const icon = getCareerIcon(career.name);
        const trendBadge = getTrendBadge(career.trend);

        // Determine demand badge class
        let demandClass = 'demand-medium';
        if (career.demand.toLowerCase() === 'high') {
            demandClass = 'demand-high';
        } else if (career.demand.toLowerCase() === 'low') {
            demandClass = 'demand-low';
        }

        card.innerHTML = `
            <div class="career-card-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="career-card-title">${career.name}</div>
            <div class="career-card-description">${career.description}</div>
            <div class="career-card-market">
                <div style="margin-bottom: 10px;">
                    <span class="market-badge ${trendBadge.class}">${trendBadge.emoji} ${trendBadge.text}</span>
                    <span class="market-badge ${demandClass}">Demand: ${career.demand}</span>
                </div>
                <div class="market-insights">💡 ${career.insights}</div>
            </div>
        `;

        container.appendChild(card);
    });

    // Show the container
    container.classList.remove('hidden');
}

// Share to Twitter
function shareToTwitter() {
    if (!window.currentCareers) return;

    const careersText = window.currentCareers.map(c => c.name).join(', ');
    const text = `I just discovered my ideal career paths: ${careersText}! 🚀 Check out this AI Career Recommender!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Share to LinkedIn
function shareToLinkedIn() {
    if (!window.currentCareers) return;

    const careersText = window.currentCareers.map(c => c.name).join(', ');
    const text = `Excited to explore career opportunities in: ${careersText}! AI-powered career guidance is amazing! 💼`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Share to WhatsApp
function shareToWhatsApp() {
    if (!window.currentCareers) return;

    const careersText = window.currentCareers.map((c, i) => `${i + 1}. ${c.name} - ${c.description}`).join('\n');
    const text = `🎯 My AI Career Recommendations:\n\n${careersText}\n\nDiscover yours too!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Copy to Clipboard
function copyToClipboard() {
    if (!window.currentCareers) return;

    const careersText = window.currentCareers.map((c, i) =>
        `${i + 1}. ${c.name}\n   - ${c.description}\n   - Market Demand: ${c.demand}\n   - Trend: ${c.trend}\n   - Insight: ${c.insights}`
    ).join('\n\n');

    const text = `My AI Career Recommendations:\n\nInterests: ${window.currentInterests}\n\n${careersText}`;

    navigator.clipboard.writeText(text).then(() => {
        // Show confirmation
        const btn = event.target.closest('.share-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard');
        console.error('Copy error:', err);
    });
}

// Generate PDF
function generatePDF() {
    if (!window.currentCareers) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 127, 80);
    doc.text('AI Career Recommendations', 20, 20);

    // Interests
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Your Interests:', 20, 35);
    doc.setFontSize(10);
    doc.text(window.currentInterests, 20, 42, { maxWidth: 170 });

    let yPosition = 55;

    // Careers
    window.currentCareers.forEach((career, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        // Career number and name
        doc.setFontSize(14);
        doc.setTextColor(255, 127, 80);
        doc.text(`${index + 1}. ${career.name}`, 20, yPosition);
        yPosition += 8;

        // Description
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Why it fits:', 25, yPosition);
        yPosition += 5;
        doc.text(career.description, 25, yPosition, { maxWidth: 165 });
        yPosition += 10;

        // Market data
        doc.text(`Market Demand: ${career.demand} | Trend: ${career.trend}`, 25, yPosition);
        yPosition += 5;
        doc.setTextColor(100, 100, 100);
        doc.text(`Insight: ${career.insights}`, 25, yPosition, { maxWidth: 165 });
        yPosition += 12;

        // Reset color
        doc.setTextColor(0, 0, 0);
    });

    // Add roadmap if available
    const roadmapResult = document.getElementById('roadmapResult');
    if (roadmapResult && roadmapResult.innerText.trim()) {
        if (yPosition > 200) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(255, 127, 80);
        doc.text('Your Career Roadmap', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const roadmapText = roadmapResult.innerText.substring(0, 1000); // Limit length
        doc.text(roadmapText, 20, yPosition, { maxWidth: 170 });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated by AI Career Recommender - Page ${i} of ${pageCount}`, 20, 285);
    }

    // Download
    doc.save('My-Career-Recommendations.pdf');
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
        // Call our serverless function instead of Gemini directly
        const response = await fetch('/api/roadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPosition: current,
                targetCareer: target
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate roadmap');
        }

        const data = await response.json();
        const text = data.response;

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

        if (e.message.includes('Quota exceeded') || e.message.includes('429')) {
            roadmapResult.innerHTML = `
                <div style="padding: 15px; color: #FFA500; text-align: center;">
                    ⚠️ Quota limit reached. Please wait 1 minute and try again.
                </div>
            `;
        } else {
            roadmapResult.innerHTML = "Error generating roadmap. Try again.";
        }
    } finally {
        roadmapLoading.classList.add('hidden');
        roadmapBtn.disabled = false;
    }
});
