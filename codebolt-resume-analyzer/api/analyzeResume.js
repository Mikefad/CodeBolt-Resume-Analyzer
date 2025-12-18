import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are CodeBolt, an expert resume reviewer for international students pursuing early-career software roles.
Given a resume (and optional job details), respond in JSON with the following shape:
{
  "score": number between 0 and 100,
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "keywordMatch": {
    "overallMatchPercent": number between 0 and 100,
    "matchedKeywords": string[],
    "missingKeywords": string[]
  },
  "improvementSuggestions": string[]
}
Always produce valid JSON without additional commentary.`;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { resumeText, jobTitle, jobDescription, userId } = request.body ?? {};

  if (!resumeText || typeof resumeText !== 'string') {
    response.status(400).json({ error: 'resumeText is required and must be a string' });
    return;
  }

  try {
    const completion = await client.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      input: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            { type: 'input_text', text: `Resume: ${resumeText}` },
            { type: 'input_text', text: `User ID (optional): ${userId ?? 'N/A'}` },
            { type: 'input_text', text: `Target Job Title: ${jobTitle ?? 'N/A'}` },
            { type: 'input_text', text: `Target Job Description: ${jobDescription ?? 'N/A'}` },
          ],
        },
      ],
    });

    let raw = completion.output?.[0]?.content?.[0]?.text;
    if (!raw) {
      throw new Error('No response content returned from OpenAI');
    }
    raw = raw.trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
    }
    const parsed = JSON.parse(raw);

    response.status(200).json(parsed);
  } catch (error) {
    console.error('analyzeResume error', error);
    response.status(500).json({
      error: 'Failed to analyze resume. Please try again later.',
      details: error.message,
    });
  }
}
