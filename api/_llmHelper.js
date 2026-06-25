// LLM helper function to call Gemini, ChatGPT, Claude, or Groq dynamically based on environment variables
export async function callLLM(prompt) {
    const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
    const apiKey = process.env.LLM_API_KEY;

    if (!apiKey) {
        throw new Error(`LLM_API_KEY is not configured in the environment variables.`);
    }

    switch (provider) {
        case 'gemini': {
            const model = 'gemini-3.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
                throw new Error(errorData.error?.message || 'Failed to get response from Gemini API');
            }

            const data = await response.json();
            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response format received from Gemini API');
            }
            return data.candidates[0].content.parts[0].text;
        }

        case 'chatgpt': {
            const model = 'gpt-4o-mini';
            const url = 'https://api.openai.com/v1/chat/completions';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to get response from OpenAI API');
            }

            const data = await response.json();
            if (!data.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format received from OpenAI API');
            }
            return data.choices[0].message.content;
        }

        case 'claude': {
            const model = 'claude-3-5-sonnet-20241022';
            const url = 'https://api.anthropic.com/v1/messages';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 2048,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to get response from Anthropic API');
            }

            const data = await response.json();
            if (!data.content?.[0]?.text) {
                throw new Error('Invalid response format received from Anthropic API');
            }
            return data.content[0].text;
        }

        case 'groq': {
            const model = 'llama-3.3-70b-versatile';
            const url = 'https://api.groq.com/openai/v1/chat/completions';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to get response from Groq API');
            }

            const data = await response.json();
            if (!data.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format received from Groq API');
            }
            return data.choices[0].message.content;
        }

        default: {
            throw new Error(`Unsupported LLM provider: ${provider}`);
        }
    }
}
