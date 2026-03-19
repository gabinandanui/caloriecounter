import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { foodData } = req.body;

  if (!foodData || foodData.length === 0) {
    return res.status(400).json({ error: 'Food data is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('[AI Tips] Checking API key...');
    
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.error('[AI Tips] GEMINI_API_KEY is not set or is using placeholder value');
      return res.status(400).json({ error: 'The Gemini API key is missing or is using a placeholder. Please check your .env file.' });
    }

    // Safely log the start of the key for debugging
    console.log(`[AI Tips] Using key starting with: ${apiKey.substring(0, 5)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GENERATIVE_MODEL || 'gemini-1.5-flash';
    console.log('[AI Tips] Using model:', modelName);
    
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
You are a health and nutrition expert. A user has provided their food intake for the day.
Analyze the following food data and provide personalized, actionable suggestions to help the user achieve their health goals.
The user's goal is to have a balanced diet. If you see a high intake of carbohydrates, suggest alternatives that are rich in protein, fat, or fiber.

Here is the user's food data for the day:
${JSON.stringify(foodData, null, 2)}

Based on this data, provide:
1. A brief, one-sentence summary of their overall intake.
2. Two or three specific, actionable tips to improve their diet, in bullet points. Keep the tips concise.
3. A sample healthy meal suggestion for the next day.

Keep the entire response short, crisp, and easy to read.
`;

    console.log('[AI Tips] Requesting generations from Google AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
        throw new Error("The AI returned an empty response.");
    }

    console.log('[AI Tips] Successfully generated suggestions.');
    res.status(200).json({ suggestions: text });
  } catch (error) {
    console.error('[AI Tips] CRITICAL ERROR:', error);
    
    let status = 500;
    let message = 'An unknown error occurred during AI analysis.';

    // Extract detailed error messages
    if (error.status === 400 || error.message?.includes('API_KEY_INVALID') || error.message?.includes('not valid')) {
        status = 400;
        message = 'The Gemini API key provided is not valid. Please check your .env file.';
    } else if (error.message?.includes('SAFETY')) {
        message = 'The AI content was blocked due to safety filters.';
    } else if (error.message) {
        message = error.message;
    }

    res.status(status).json({ error: message });
  }
}