import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    // 1. Fetch all tasks from Supabase
    const supabase = createAdminSupabaseClient();
    const { data: tasks, error: dbError } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active'); // Only active tasks

    if (dbError) throw dbError;
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ matchedIds: [] });
    }

    // 2. Prepare catalog for Gemini
    const catalogForAI = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      tags: t.dubs
    }));

    // 3. Prompt Gemini Flash-8B for semantic matching
    const prompt = `
You are the Nyxa Semantic Intent Engine. 
The user is searching for: "${query}"

Here is the current catalog of available tasks (JSON):
${JSON.stringify(catalogForAI, null, 2)}

Your job is to find which tasks semantically match the user's intent. 
They might use completely different words. For example, if they ask for "emails", a "Lead Generation" or "Scraping" task might match perfectly.

Rules:
1. ONLY return a raw JSON array of the matching task IDs (strings).
2. DO NOT include any markdown, explanation, or codeblocks like \`\`\`json. Just the raw array e.g. ["id1", "id2"].
3. If NO tasks match the intent, return an empty array: []
`;

    // 4. Call Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // 5. Parse Gemini's output
    let matchedIds: string[] = [];
    try {
        // Handle case where Gemini might return markdown despite instructions
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        matchedIds = JSON.parse(cleanJson);
        if (!Array.isArray(matchedIds)) {
            matchedIds = [];
        }
    } catch (parseError) {
        console.error('Failed to parse Gemini response:', responseText);
        matchedIds = [];
    }

    return NextResponse.json({ matchedIds });

  } catch (error: any) {
    console.error('Error in semantic search:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
