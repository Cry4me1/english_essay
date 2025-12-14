import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();

        if (!topic) {
            return new Response(JSON.stringify({ error: 'Topic is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const prompt = `Based on the broad topic "${topic}", suggest 5 specific, engaging, and suitable essay titles or prompts for an English writing task (IELTS/TOEFL level).
    
    Output format: STRICT JSON array of strings. Example: ["Title 1", "Title 2", ...]
    Do not output anything else.`;

        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            stream: false,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content || '[]';

        // Attempt to parse JSON strictly
        let suggestions = [];
        try {
            const parsed = JSON.parse(content);
            // Handle case where model wraps it in a key
            if (parsed.topics && Array.isArray(parsed.topics)) {
                suggestions = parsed.topics;
            } else if (Array.isArray(parsed)) {
                suggestions = parsed;
            } else {
                // Fallback: try to find array in object keys or values if structure is unexpected
                const values = Object.values(parsed);
                const arrayValue = values.find(v => Array.isArray(v));
                if (arrayValue) {
                    suggestions = arrayValue;
                }
            }
        } catch (e) {
            console.error("JSON parse failed", e);
            // Fallback manual extraction if JSON mode fails or returns text
            const matches = content.match(/"([^"]+)"/g);
            if (matches) {
                suggestions = matches.map(s => s.replace(/"/g, ''));
            }
        }

        // Ensure we have strings
        suggestions = suggestions.map((s: any) => String(s)).slice(0, 5);

        return new Response(JSON.stringify({ topics: suggestions }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Brainstorm API error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate ideas' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
