// Vercel Serverless Function: Career Roadmap Generation
// This function securely handles roadmap generation via Gemini API

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
        const { currentPosition, targetCareer } = req.body;

        if (!currentPosition || !targetCareer) {
            return res.status(400).json({
                error: 'Both currentPosition and targetCareer are required'
            });
        }

        // Get API key from environment variables (secure!)
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Build prompt for roadmap
        const prompt = `Create a specific, simple 5-step roadmap for someone who is currently a "${currentPosition}" and wants to become a "${targetCareer}".
    For each step:
    1. Give a bold title (e.g., **Step 1: Learn Basics**).
    2. One sentence of advice.
    Format as a Markdown list.`;

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

        // Return the roadmap text
        return res.status(200).json({ response: responseText });

    } catch (error) {
        console.error('Function Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
