import axios from "axios";
import { GEMINI_API_KEY } from "../constants";

// Define types for API responses
export interface GeminiImagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: GeminiImagePart[];
    };
  }>;
}

/**
 * Makes a request to the Gemini text model to generate meme descriptions
 * @param prompt The text prompt to generate meme descriptions from
 * @returns An array of meme descriptions, or empty array on error
 */
export const generateMemeDescriptions = async (
  prompt: string
): Promise<string[]> => {
  try {
    const apiKey = GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        "API key is not defined. Check your .env or .env.local file and make sure REACT_APP_GEMINI_API_KEY is set."
      );
      throw new Error("API key is not defined. Check your configuration.");
    }

    const lawMemeInstructions =
      "You are a NZ law meme generator. Create 4 different humorous, witty, and creative meme descriptions related to law, legal concepts, lawyers, judges, courtrooms, or legal proceedings. Each description clear and be detailed enough to create a unique and entertaining visual meme. Make sure to include very different formats, including cartoons, pictures with text, doge, and 4-panel comics. Do not include more than 12 words for the text conent of each meme (the description should be much more than 12 words). Respond with exactly 4 descriptions, each on a new line, without any additional text, numbering, or formatting. Make sure to include details of the user's prompt, like names, places or concepts given in every meme description. Each description MUST state at the beginning 'Square image.'";

    const response = await axios.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: `${lawMemeInstructions}\n\nTopic: ${prompt}` }],
          },
        ],
      }
    );

    // Get the text response
    const parts = response.data.candidates[0].content.parts;
    const textPart = parts.find((part) => part.text);

    if (textPart && textPart.text) {
      // Split the response into individual descriptions (one per line)
      return textPart.text
        .split("\n")
        .filter((line) => line.trim() !== "")
        .slice(0, 4);
    }

    console.warn("No text found in response, returning empty array");
    return [];
  } catch (err) {
    console.error("Error generating meme descriptions:", err);
    return [];
  }
};

/**
 * Makes a request to the Gemini API to generate an image based on the provided prompt
 * @param prompt The text prompt to generate an image from
 * @returns A base64 encoded string of the generated image, or empty string on error
 */
export const makeGeminiRequest = async (prompt: string): Promise<string> => {
  try {
    const apiKey = GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        "API key is not defined. Check your .env or .env.local file and make sure REACT_APP_GEMINI_API_KEY is set."
      );
      throw new Error("API key is not defined. Check your configuration.");
    }

    const response = await axios.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: { responseModalities: ["Text", "Image"] },
      }
    );

    // Find the image data in the response
    const parts = response.data.candidates[0].content.parts;
    const imagePart = parts.find((part) => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }

    console.warn("No image found in response, returning empty string");
    return "";
  } catch (err) {
    console.error("Error generating image:", err);
    return "";
  }
};
