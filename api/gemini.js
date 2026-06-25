// Vercel Serverless Function: Career Recommendations
// This function securely handles Gemini and OpenAI API calls from the frontend
import { callLLM } from './_llmHelper.js';

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
        const { prompt, interests } = req.body;

        let finalPrompt = '';
        if (prompt) {
            finalPrompt = prompt;
        } else if (interests) {
            finalPrompt = `I am a student interested in: ${interests}. 
    
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
        } else {
            return res.status(400).json({ error: 'Either prompt or interests is required' });
        }

        const responseText = await callLLM(finalPrompt);

        // Return the response text (frontend will parse JSON if needed)
        return res.status(200).json({ response: responseText });

    } catch (error) {
        console.error('Function Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}

