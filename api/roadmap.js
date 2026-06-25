// Vercel Serverless Function: Career Roadmap Generation
// This function securely handles roadmap generation via Gemini or OpenAI API
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
        const { prompt, currentPosition, targetCareer } = req.body;

        let finalPrompt = '';
        if (prompt) {
            finalPrompt = prompt;
        } else if (currentPosition && targetCareer) {
            finalPrompt = `Create a specific, simple 5-step roadmap for someone who is currently a "${currentPosition}" and wants to become a "${targetCareer}".
For each step:
1. Give a bold title (e.g., **Step 1: Learn Basics**).
2. One sentence of advice.
Format as a Markdown list.`;
        } else {
            return res.status(400).json({
                error: 'Either prompt or both currentPosition and targetCareer are required'
            });
        }

        const responseText = await callLLM(finalPrompt);

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

