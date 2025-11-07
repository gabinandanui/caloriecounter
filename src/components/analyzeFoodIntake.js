import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI client if API key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenerativeAI client:', e.message || e);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { todayData, totalCalories, targetCalories } = req.body;

  if (!todayData || todayData.length === 0) {
    return res.status(400).json({ error: 'No food data provided for analysis.' });
  }

  try {
    // If genAI is available, use the AI model to generate tips.
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const totalNutrition = todayData.reduce((totals, item) => {
        totals.protein += Number(item.nutrition?.protein) || 0;
        totals.carbs += Number(item.nutrition?.carbs) || 0;
        totals.fats += Number(item.nutrition?.fats) || 0;
        totals.fiber += Number(item.nutrition?.fiber) || 0;
        return totals;
      }, { protein: 0, carbs: 0, fats: 0, fiber: 0 });
      
      const foodListDetails = todayData.map(
        (entry) =>
          `- ${entry.quantity} ${entry.measurement} of ${entry.food_name} (Carbs: ${Number(entry.nutrition?.carbs || 0).toFixed(1)}g, Protein: ${Number(entry.nutrition?.protein || 0).toFixed(1)}g, Fats: ${Number(entry.nutrition?.fats || 0).toFixed(1)}g, Fiber: ${Number(entry.nutrition?.fiber || 0).toFixed(1)}g)`
      ).join('\n');

      const prompt = `
      You are an expert-level, friendly, and encouraging health assistant. Analyze the user's food intake for the day and provide 2-3 concise, actionable, and intelligent tips based on their total nutrition and individual food items.
      Your primary goal is to help the user make healthier food choices by suggesting practical alterations to high-carb foods.

      User's daily intake:
      - Consumed Calories: ${totalCalories}
      - Target Calories: ${targetCalories}
      - Today's Detailed Food List:
        ${foodListDetails}

      Summary Nutrition:
      - Total Protein: ${totalNutrition.protein.toFixed(1)}g
      - Total Carbs: ${totalNutrition.carbs.toFixed(1)}g
      - Total Fats: ${totalNutrition.fats.toFixed(1)}g
      - Total Fiber: ${totalNutrition.fiber.toFixed(1)}g

      Based on this data, provide helpful and specific tips. **Your top priority is to identify any high-carb foods consumed in significant quantities from the "Today's Detailed Food List" and propose concrete, healthy alterations to reduce carb intake and increase protein, good fats, and fiber.** For instance, if the user consumed 'plain dosa', suggest reducing the quantity and adding protein-rich fillings like paneer or peas. If no such high-carb items are present, then provide general tips based on calorie and macronutrient summary. Your goal is to help the user make smarter food choices without being restrictive, always maintaining a positive and supportive tone.
      
      Ensure the suggestions are actionable and directly relate to the food items listed in the "Detailed Food List".

      Return ONLY a valid JSON object with a single key "tips". The value should be a single string containing the tips, with each tip separated by a newline character.

      Example response:
      \`\`\`json
      {
        "tips": "You're doing great! You're close to your calorie goal.\nConsider a short walk to aid digestion.\nMaybe add a bit more protein tomorrow, like some lentils or chicken."
      }
      \`\`\`
    `;

      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();
      console.log('Raw response from Gemini:', responseText); // Log the raw response

      // Clean and parse the response
      const cleanedText = responseText.replace(/```json\n|\n```/g, '').trim();

      // Add a check to ensure cleanedText is not empty before parsing
      if (!cleanedText) {
        console.error('Error: Received empty response from Gemini after cleaning.');
        return res.status(500).json({ error: 'Received empty response from AI model.' });
      }

      let jsonData;
      try {
        jsonData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Error parsing JSON from Gemini:', parseError);
        console.error('Cleaned text that failed to parse:', cleanedText);
        return res.status(500).json({ error: 'Failed to parse AI response.' });
      }

      return res.status(200).json(jsonData);
    }

    // Fallback: no AI client available — richer, rule-based analysis
    const total = Number(totalCalories) || todayData.reduce((s, e) => s + (Number(e.nutrition?.calories) || 0), 0);
    const target = Number(targetCalories) || 0;

    // Compute macro totals and build item list
    const totals = todayData.reduce(
      (acc, e) => {
        acc.calories += Number(e.nutrition?.calories) || 0;
        acc.protein += Number(e.nutrition?.protein) || 0;
        acc.carbs += Number(e.nutrition?.carbs) || 0;
        acc.fats += Number(e.nutrition?.fats) || 0;
        acc.fiber += Number(e.nutrition?.fiber) || 0;
        acc.items.push({
          name: String(e.food_name || '').toLowerCase(),
          qty: e.quantity,
          measurement: e.measurement,
          calories: Number(e.nutrition?.calories) || 0,
          protein: Number(e.nutrition?.protein) || 0,
          carbs: Number(e.nutrition?.carbs) || 0,
          fats: Number(e.nutrition?.fats) || 0,
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, items: [] }
    );

    const summary = {
      consumed: Math.round(totals.calories || total),
      target: Math.round(target),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fats: Math.round(totals.fats),
      fiber: Math.round(totals.fiber),
    };

    const diff = summary.consumed - summary.target;
    const closeness = Math.abs(diff) <= 50; // within 50 cal considered "close"

    const tips = [];

    if (!summary.target || summary.target === 0) {
      tips.push('No target calories provided — set a daily target in settings.');
    } else if (closeness) {
      tips.push(`You're very close to your target (target: ${summary.target} cal, consumed: ${summary.consumed} cal). Small adjustments will help dial it in.`);
    } else if (summary.consumed < summary.target) {
      tips.push(`You're under your calorie target by ${summary.target - summary.consumed} calories — if you want to meet the target, add a small healthy snack.`);
    } else if (summary.consumed > summary.target) {
      tips.push(`You've exceeded your calorie target by ${summary.consumed - summary.target} calories — consider lighter choices or a short walk.`);
    }

    // Protein check
    if (totals.protein < 25) {
      tips.push('Protein looks low today — consider adding protein-rich items like Greek yogurt, paneer, eggs, lentils, or a protein shake.');
    }

    // Identify high-carb items and suggest concrete modifications
    const suggestions = {};
    totals.items.forEach((it) => {
      // simple heuristics to detect starchy/high-carb foods
      if (it.name.includes('dosa') || it.name.includes('plain dosa') || it.name.includes('idli')) {
        suggestions[it.name] = suggestions[it.name] || [];
        suggestions[it.name].push('Dosa is carbohydrate-heavy. Add a protein-rich filling such as paneer bhurji, spiced peas, or egg masala.');
        suggestions[it.name].push('Serve with curd or a protein-rich chutney to increase protein and lower glycemic impact.');
      }
      if (it.name.includes('rice') || it.name.includes('plain rice') || it.name.includes('white rice')) {
        suggestions[it.name] = suggestions[it.name] || [];
        suggestions[it.name].push('Rice is high in carbs — try mixing with lentils (dal) or adding a protein/veg-rich curry or peas to balance.');
        suggestions[it.name].push('Consider smaller portion and add salad or vegetables to increase fiber and volume.');
      }
      if (it.carbs > (it.protein * 2) && it.carbs > 20) {
        // generic high-carb detection
        suggestions[it.name] = suggestions[it.name] || [];
        suggestions[it.name].push('This item is relatively high in carbs compared to protein. Consider pairing it with a protein source (eggs, paneer, legumes) or increasing vegetables.');
      }
      if (it.name.includes('dosa') && it.qty >= 3) {
        suggestions[it.name] = suggestions[it.name] || [];
        suggestions[it.name].push('You ate several dosas — reduce to 1-2 and add a protein-rich side like paneer or egg bhurji.');
      }
    });

    // If no specific suggestions found, add general advice based on macronutrients
    if (Object.keys(suggestions).length === 0) {
      if (totals.carbs > totals.protein * 3) {
        tips.push('Carbohydrates are much higher than protein today — try increasing protein at the next meal (e.g., add paneer, lentils, or eggs).');
      } else {
        tips.push('Your macronutrient balance looks reasonable. Keep focusing on whole foods and lean proteins.');
      }
    } else {
      tips.push('Here are specific suggestions for items you ate:');
      Object.entries(suggestions).forEach(([name, sug]) => {
        // present readable name
        const pretty = name.charAt(0).toUpperCase() + name.slice(1);
        tips.push(`${pretty}: ${sug.join(' ')}`);
      });
    }

    // Return structured result so frontend can show summary + tips + suggestions
    return res.status(200).json({
      summary,
      tips: tips.join('\n'),
      itemSuggestions: suggestions,
    });

  } catch (err) {
    console.error('Error in analyzeFoodIntake handler:', err);
    res.status(500).json({ error: 'Failed to analyze food intake with AI' });
  }
}