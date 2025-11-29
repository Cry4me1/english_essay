import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  const { topic, tone, words } = await req.json();

  const toneMap: Record<string, string> = {
    Academic: '学术正式风格，使用复杂句式和高级词汇',
    Conversational: '口语化风格，自然流畅',
    Polite: '礼貌正式风格，适用于书信申请',
    Neutral: '中立客观风格，适用于托福综合写作',
    Debate: '辩论风格，观点鲜明，论证有力',
  };

  const toneInstruction = toneMap[tone] || toneMap.Academic;

  const prompt = `You are an expert IELTS/TOEFL essay writing tutor. Generate a well-structured English essay based on the following requirements:

Topic: ${topic}
Tone: ${toneInstruction}
Target Word Count: approximately ${words} words

Requirements:
1. The essay MUST have clear structure with Introduction, Body paragraphs, and Conclusion
2. Use appropriate academic vocabulary and varied sentence structures
3. Include topic sentences, supporting details, and smooth transitions
4. Maintain logical flow and coherence throughout
5. Output ONLY the essay content, no additional commentary

Begin the essay now:`;

  try {
    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return new Response('AI 服务暂时不可用', { status: 500 });
  }
}
