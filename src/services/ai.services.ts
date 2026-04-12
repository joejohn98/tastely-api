import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config";

type SentimentAnalysisResult = {
  sentiment: "positive" | "neutral" | "negative";
  themes: string[];
};

const genAI = new GoogleGenAI({ apiKey: config.geminiApiKey });

async function analyzeSentiment(
  reviewText: string,
): Promise<SentimentAnalysisResult> {
  const prompt = `
    Analyze the following restaurant review and respond ONLY with valid JSON.
    No explanation, no markdown, just raw JSON.

    Review: "${reviewText}"

    Response format:
    {
      "sentiment": "positive" | "neutral" | "negative",
      "themes": ["array", "of", "key", "topics", "mentioned"]
    }
  `;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
      maxOutputTokens: 200,
    },
  });
  const text = result.text?.trim();

  if (!text) {
    throw new Error("AI response text is undefined");
  }

  return JSON.parse(text) as SentimentAnalysisResult;
}

async function generateReviewSummary(
  reviews: { reviewText: string; rating: number }[],
): Promise<string> {
  const formattedReviews = reviews
    .map((r) => `Rating: ${r.rating}/5 - "${r.reviewText}"`)
    .join("\n");

  const prompt = `
      Summarize the following customer reviews for a restaurant in 2-3 sentences.
      Be balanced, highlight common praises and complaints.

      Reviews:
      ${formattedReviews}
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 200,
      },
    });
    const text = result.text?.trim();
    
    if (!text) {
      throw new Error("AI response text is undefined");
    }
    
    return text;
}

export { analyzeSentiment, generateReviewSummary };
