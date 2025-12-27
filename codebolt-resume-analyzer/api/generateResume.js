import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are CodeBolt, a resume writer for international students applying to tech roles.
Return ONLY valid JSON in this exact shape:
{
  "fullName": string,
  "headline": string,
  "contact": {
    "email": string,
    "phone": string,
    "location": string,
    "links": string[]
  },
  "summary": string,
  "skills": string[],
  "experience": [
    {
      "role": string,
      "company": string,
      "location": string,
      "start": string,
      "end": string,
      "bullets": string[]
    }
  ],
  "education": [
    {
      "degree": string,
      "school": string,
      "location": string,
      "start": string,
      "end": string,
      "details": string[]
    }
  ],
  "certifications": string[],
  "projects": [
    {
      "name": string,
      "description": string,
      "bullets": string[]
    }
  ]
}
Requirements:
- Tailor content to the target job title/description.
- Use concise, impact-focused bullet points.
- Keep output to one-page worth of content.
- If a field is missing from the resume, return an empty string or empty array.`;

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
      temperature: 0.4,
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
    console.error('generateResume error', error);
    response.status(500).json({
      error: 'Failed to generate a tailored resume. Please try again later.',
      details: error.message,
    });
  }
}
