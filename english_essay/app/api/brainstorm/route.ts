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
    
    Output format: STRICT JSON object with a "topics" key containing an array of objects. Each object must have:
    - "topic": the English essay title/prompt
    - "translation": the Chinese translation of the topic

    Example:
    {
      "topics": [
        {"topic": "The Impact of Social Media on Modern Communication", "translation": "社交媒体对现代沟通的影响"},
        {"topic": "Should Governments Regulate Artificial Intelligence?", "translation": "政府是否应该监管人工智能？"}
      ]
    }
    
    Do not output anything else.`;

        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            stream: false,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content || '{}';

        // Attempt to parse JSON strictly
        interface TopicSuggestion {
            topic: string;
            translation: string;
        }
        let suggestions: TopicSuggestion[] = [];
        try {
            const parsed = JSON.parse(content);
            // Handle case where model wraps it in a key
            if (parsed.topics && Array.isArray(parsed.topics)) {
                suggestions = parsed.topics.map((item: any) => {
                    if (typeof item === 'string') {
                        return { topic: item, translation: '' };
                    }
                    return {
                        topic: String(item.topic || item),
                        translation: String(item.translation || '')
                    };
                });
            } else if (Array.isArray(parsed)) {
                suggestions = parsed.map((item: any) => {
                    if (typeof item === 'string') {
                        return { topic: item, translation: '' };
                    }
                    return {
                        topic: String(item.topic || item),
                        translation: String(item.translation || '')
                    };
                });
            } else {
                // Fallback: try to find array in object keys or values if structure is unexpected
                const values = Object.values(parsed);
                const arrayValue = values.find(v => Array.isArray(v)) as any[] | undefined;
                if (arrayValue) {
                    suggestions = arrayValue.map((item: any) => {
                        if (typeof item === 'string') {
                            return { topic: item, translation: '' };
                        }
                        return {
                            topic: String(item.topic || item),
                            translation: String(item.translation || '')
                        };
                    });
                }
            }
        } catch (e) {
            console.error("JSON parse failed", e);
            // Fallback manual extraction if JSON mode fails or returns text
            const matches = content.match(/"([^"]+)"/g);
            if (matches) {
                suggestions = matches.map(s => ({ topic: s.replace(/"/g, ''), translation: '' }));
            }
        }

        // Ensure we have valid objects
        suggestions = suggestions.slice(0, 5);

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
