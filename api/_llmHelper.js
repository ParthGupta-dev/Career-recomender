// api/_llmHelper.js
// Tries Gemini first. If it fails for ANY reason (rate limit, bad key,
// network issue, bad response), falls through to Groq automatically.

const PROVIDERS = [
    {
        name: 'gemini',
        keyEnv: 'GEMINI_API_KEY',
        call: async (prompt, apiKey) => {
            const model = 'gemini-2.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Gemini request failed (${response.status})`);
            }
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Invalid response format from Gemini');
            return text;
        }
    },
    {
        name: 'groq',
        keyEnv: 'GROQ_API_KEY',
        call: async (prompt, apiKey) => {
            const model = 'llama-3.3-70b-versatile';
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Groq request failed (${response.status})`);
            }
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (!text) throw new Error('Invalid response format from Groq');
            return text;
        }
    }
];

export async function callLLM(prompt) {
    const failures = [];

    for (const provider of PROVIDERS) {
        const apiKey = process.env[provider.keyEnv];
        if (!apiKey) {
            failures.push(`${provider.name}: ${provider.keyEnv} not set`);
            continue;
        }
        try {
            return await provider.call(prompt, apiKey);
        } catch (err) {
            console.warn(`Provider ${provider.name} failed:`, err.message);
            failures.push(`${provider.name}: ${err.message}`);
        }
    }

    throw new Error(`All providers failed. ${failures.join(' | ')}`);
}