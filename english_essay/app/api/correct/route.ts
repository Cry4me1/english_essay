import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  const { content } = await req.json();

  if (!content || content.trim().length < 50) {
    return Response.json(
      { error: '文章内容太短，请至少输入 50 个字符' },
      { status: 400 }
    );
  }

  const prompt = `You are an expert IELTS/TOEFL essay examiner. Analyze the following essay and provide detailed feedback.

Essay to analyze:
"""
${content}
"""

Instructions:
1. Provide an overall IELTS band score (0-9, can use decimals like 7.5)
2. Give a brief summary in Chinese about the essay quality
3. Break down scores into 4 dimensions: 词汇 (Vocabulary), 语法 (Grammar), 逻辑 (Logic), 连贯性 (Coherence)
4. Identify 3-5 specific issues in the essay with:
   - The EXACT original text that needs correction (must be verbatim from the essay)
   - Suggested replacement
   - Reason in Chinese explaining the improvement
5. Categorize each issue as: "grammar" (grammatical errors), "vocabulary" (word choice improvements), or "logic" (logical flow issues)
6. Generate unique IDs for each annotation in format "ann-1", "ann-2", etc.

Focus on the most impactful improvements that would help a student improve their writing.

IMPORTANT: You MUST respond with ONLY a valid JSON object in exactly this format, no other text:
{
  "score": <number between 0-9>,
  "summary": "<brief summary in Chinese>",
  "breakdown": [
    {"label": "词汇", "value": <number>},
    {"label": "语法", "value": <number>},
    {"label": "逻辑", "value": <number>},
    {"label": "连贯性", "value": <number>}
  ],
  "annotations": [
    {
      "id": "ann-1",
      "type": "grammar|vocabulary|logic",
      "originalText": "<exact text from essay>",
      "suggestion": "<improved text>",
      "reason": "<explanation in Chinese>"
    }
  ]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(responseText);

    return Response.json(result);
  } catch (error) {
    console.error('Correction API error:', error);
    return Response.json(
      { error: 'AI 批改服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
