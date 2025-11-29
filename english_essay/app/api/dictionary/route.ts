import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  const { action, text, context } = await req.json();

  if (!text || !action) {
    return Response.json(
      { error: '缺少必要参数' },
      { status: 400 }
    );
  }

  try {
    if (action === 'lookup') {
      const prompt = `Look up the English word "${text}" and provide comprehensive information.
${context ? `Context: "${context}"` : ''}

Return a JSON object with exactly this structure:
{
  "word": "${text}",
  "phonetic": "IPA phonetic transcription (e.g., /ˈeksəmpəl/)",
  "partOfSpeech": ["noun", "verb"],
  "definitions": [
    {
      "pos": "noun",
      "meaning": "中文释义",
      "example": "Example sentence in English",
      "exampleTranslation": "例句的中文翻译"
    }
  ],
  "synonyms": ["synonym1", "synonym2"],
  "antonyms": ["antonym1"]
}

Provide 2-3 most common definitions, 3-5 synonyms, and 1-3 antonyms if applicable.
Focus on the most useful and common usages.
Return ONLY valid JSON, no other text.`;

      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return Response.json(result);
    }

    if (action === 'translate') {
      const prompt = `Translate the following English text to Chinese:
"${text}"
${context ? `Context: "${context}"` : ''}

Return a JSON object with exactly this structure:
{
  "originalText": "${text}",
  "translation": "中文翻译",
  "explanation": "如有习语或文化背景需要解释，在此说明（可选）"
}

Provide a natural, fluent Chinese translation. If there are any idioms or cultural references, briefly explain them.
Return ONLY valid JSON, no other text.`;

      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return Response.json(result);
    }

    if (action === 'synonyms') {
      const prompt = `Find synonyms for the English word/phrase "${text}".
${context ? `Context: "${context}"` : ''}

Return a JSON object with exactly this structure:
{
  "word": "${text}",
  "synonyms": [
    {
      "word": "synonym word",
      "similarity": "exact|close|related",
      "usage": "简短的中文用法说明",
      "example": "A short example sentence using this synonym"
    }
  ]
}

Provide 5-8 synonyms with:
- similarity: "exact" for same meaning, "close" for very similar, "related" for somewhat similar
- usage: Brief Chinese explanation of when to use this synonym
- example: A short example sentence

Consider the context when selecting appropriate synonyms.
Return ONLY valid JSON, no other text.`;

      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return Response.json(result);
    }

    return Response.json(
      { error: '无效的操作类型' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Dictionary API error:', error);
    return Response.json(
      { error: '词典服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
