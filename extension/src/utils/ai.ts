import type { Assignment, TShirtSize } from '../types/models';

const HARDCODED_API_KEY = 'YOUR_DUMMY_API_KEY'; // Replace with a real key for testing

interface SubTaskGenerated {
  title: string;
  dueAt: string;
  tShirtSize: TShirtSize;
}

export async function breakdownTaskWithGemini(
  parentTask: Assignment,
  apiKey?: string
): Promise<SubTaskGenerated[]> {
  const keyToUse = apiKey && apiKey.trim() !== '' ? apiKey : HARDCODED_API_KEY;

  if (keyToUse === 'YOUR_DUMMY_API_KEY') {
    // Return mock data for testing since we don't have a real hardcoded key
    const now = new Date().getTime();
    const dueTime = new Date(parentTask.dueAt).getTime();
    const diff = dueTime - now;
    
    return [
      {
        title: `[AI] Setup / Research for ${parentTask.title}`,
        dueAt: new Date(now + diff * 0.33).toISOString(),
        tShirtSize: 'S',
      },
      {
        title: `[AI] Core Implementation of ${parentTask.title}`,
        dueAt: new Date(now + diff * 0.66).toISOString(),
        tShirtSize: 'M',
      },
      {
        title: `[AI] Final Review and Submission`,
        dueAt: new Date(dueTime - 1000 * 60 * 60).toISOString(), // 1 hour before
        tShirtSize: 'S',
      }
    ];
  }

  const prompt = `
You are a productivity AI. The user has a large task that they are overwhelmed by.
Task Title: "${parentTask.title}"
Task Due Date: ${parentTask.dueAt}
Current Date: ${new Date().toISOString()}

Please break this task down into 3 to 5 smaller, actionable sub-tasks.
Space out the due dates of the sub-tasks so they are spread evenly between the Current Date and the Task Due Date. The final sub-task should be due slightly before the Task Due Date.

Requirements:
- tShirtSize must be either "S" (Small, ~1 hr) or "M" (Medium, ~3 hrs).
- dueAt must be a valid ISO-8601 datetime string.

Return ONLY a valid JSON array of objects. Do not include markdown formatting or backticks.
Example format:
[
  { "title": "Read chapter 1", "dueAt": "2026-10-15T12:00:00Z", "tShirtSize": "S" },
  { "title": "Write draft", "dueAt": "2026-10-18T12:00:00Z", "tShirtSize": "M" }
]
  `.trim();

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API Error: ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Clean up potential markdown formatting
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const subTasks = JSON.parse(cleanedText) as SubTaskGenerated[];
    
    return subTasks;
  } catch (error) {
    console.error('Failed to breakdown task:', error);
    throw error;
  }
}
