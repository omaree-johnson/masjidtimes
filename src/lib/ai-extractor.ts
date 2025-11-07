import { GoogleGenerativeAI } from '@google/generative-ai';
import { DailyPrayerTime } from './types';

export interface AIExtractionProgress {
  status: string;
  progress: number;
}

/**
 * Extract prayer times using Google Gemini Vision API
 * This provides much more accurate extraction than OCR alone
 */
export async function extractWithAI(
  file: File,
  onProgress?: (progress: AIExtractionProgress) => void
): Promise<DailyPrayerTime[]> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.');
  }

  if (onProgress) {
    onProgress({ status: 'Preparing image for AI analysis...', progress: 0.1 });
  }

  // Convert file to base64
  const base64Data = await fileToBase64Data(file);

  if (onProgress) {
    onProgress({ status: 'Sending to Gemini vision model...', progress: 0.3 });
  }

  try {
    const prompt = `You are an expert at extracting prayer timetables from images. Your job is to:
1. Identify the prayer times table in the image
2. Extract BOTH the Adhan (beginning/start) times AND Iqama (congregation/jamat/jama at) times for each prayer
3. Extract data for ALL days shown in the timetable
4. Return the data in a structured JSON format

CRITICAL INSTRUCTIONS:
- Extract Fajr, Dhuhr, Asr, Maghrib, and Isha times
- For each prayer, there are TWO columns: START/ADHAN and JAMA AT/IQAMA
- Look for column headers like "START" and "JAMA AT" or "JAMAAT" or "IQAMA"
- Some rows may have different background colors (yellow, green, orange) - IGNORE the colors and extract ALL rows equally
- Highlighted/colored rows are just as important as normal rows - don't skip them!
- If a cell shows quotation marks (") it means "same as above" - use the value from the previous row
- Dates should be in YYYY-MM-DD format
- Times should be in 24-hour HH:MM format
- Include ALL days visible in the timetable
- Pay special attention to Friday (Jumu'ah) rows which are often highlighted

Please extract ALL prayer times from this timetable image. Return ONLY a JSON object with this exact structure (no markdown, no code blocks, just raw JSON):

{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "fajr": "HH:MM",
      "fajrIqama": "HH:MM",
      "dhuhr": "HH:MM",
      "dhuhrIqama": "HH:MM",
      "asr": "HH:MM",
      "asrIqama": "HH:MM",
      "maghrib": "HH:MM",
      "maghribIqama": "HH:MM",
      "isha": "HH:MM",
      "ishaIqama": "HH:MM"
    }
  ]
}

Notes:
- NEVER use the same time for both adhan and iqama unless they are truly identical in the table
- Convert all times to 24-hour format
- Extract data for EVERY day shown in the table
- Ensure dates are continuous and match what's shown
- Handle quotation marks (") by copying the time from the cell above
- Return ONLY the JSON object, no other text`;

    // Use REST API with v1beta (supports gemini-2.5-flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { 
                  inline_data: { 
                    mime_type: file.type,
                    data: base64Data
                  } 
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (onProgress) {
      onProgress({ status: 'Processing AI response...', progress: 0.8 });
    }

    if (!content) {
      throw new Error('No response from Gemini model');
    }

    // Clean up the response - remove markdown code blocks if present
    let jsonText = content.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    const parsed = JSON.parse(jsonText);
    
    if (!parsed.days || !Array.isArray(parsed.days)) {
      throw new Error('Invalid response format from AI');
    }

    // Convert to our DailyPrayerTime format
    const results: DailyPrayerTime[] = parsed.days.map((day: any) => ({
      date: day.date,
      fajr: day.fajr,
      fajrIqama: day.fajrIqama,
      dhuhr: day.dhuhr,
      dhuhrIqama: day.dhuhrIqama,
      asr: day.asr,
      asrIqama: day.asrIqama,
      maghrib: day.maghrib,
      maghribIqama: day.maghribIqama,
      isha: day.isha,
      ishaIqama: day.ishaIqama,
    }));

    if (onProgress) {
      onProgress({ status: 'Extraction complete!', progress: 1.0 });
    }

    return results;

  } catch (error) {
    console.error('AI extraction error:', error);
    throw new Error(`AI extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert File to base64 (data part only, without data URL prefix)
 */
async function fileToBase64Data(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if AI extraction is available (API key configured)
 */
export function isAIExtractionAvailable(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  return !!apiKey && apiKey !== 'your_gemini_api_key_here';
}
