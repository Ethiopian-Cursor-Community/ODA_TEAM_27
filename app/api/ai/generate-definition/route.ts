import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const grade = body.grade;
    const subject = body.subject;
    const unit = body.unit ?? body.subject;
    const topic = body.topic;

    if (!grade || !subject || !topic) {
      return Response.json(
        { error: 'Missing required fields: grade, subject, topic' },
        { status: 400 }
      );
    }

    const prompt = `You are an Ethiopian grade 9-12 textbook writer. Write a clear, educational definition for:
Grade ${grade}, Subject ${subject}, Unit ${unit}, Topic: ${topic}

The definition should:
- Match Ethiopian curriculum standards
- Be 2-3 sentences long
- Use proper scientific/mathematical language
- Be easy for Ethiopian students to understand

Return ONLY the definition text, no explanations.`;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
    });

    const definition = text.trim().replace(/^["']|["']$/g, '');

    return Response.json({ definition });
  } catch (error) {
    console.error('Error in generate-definition route:', error);
    return Response.json(
      { error: 'Failed to generate definition' },
      { status: 500 }
    );
  }
}
