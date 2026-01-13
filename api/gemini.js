// Vercel Serverless Function: Career Recommendations
// This function securely handles Gemini API calls from the frontend

export default async function handler(req, res) {
    // Enable CORS for frontend requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { interests } = req.body;

        if (!interests) {
            return res.status(400).json({ error: 'Interests are required' });
        }

        // Get API key from environment variables (secure!)
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Build prompt for Gemini
        const prompt = `I am a student interested in: ${interests}. 
    
    Suggest EXACTLY 3 specific career paths for me with detailed market analysis.
    
    For each career, provide the following in JSON format:
    {
        "careers": [
            {
                "name": "Career Name",
                "description": "Brief why it fits (2-3 sentences)",
                "demand": "High|Medium|Low",
                "trend": "Hot|Growing|Stable|Declining",
                "insights": "Brief market insight about this career (1-2 sentences)"
            }
        ]
    }
    
    Make it a valid JSON array. Do not include any other text, just the JSON object.`;

        // Call Gemini API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

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
            console.error('Gemini API Error:', errorData);
            return res.status(response.status).json({
                error: errorData.error?.message || 'Failed to get AI response'
            });
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;

        // Return the raw response text (frontend will parse JSON)
        return res.status(200).json({ response: responseText });

    } catch (error) {
        console.error('Function Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
