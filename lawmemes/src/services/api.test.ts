import axios from "axios";
import { makeGeminiRequest, generateMemeDescriptions } from "./api";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock environment variables
jest.mock("../constants", () => ({
  GEMINI_API_KEY: "test-api-key",
}));

describe("makeGeminiRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("makes a proper API call to Gemini", async () => {
    // Mock successful response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: "test-base64-data",
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const result = await makeGeminiRequest("test prompt");

    // Check axios was called correctly
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent"
      ),
      expect.objectContaining({
        contents: [
          {
            parts: [{ text: "test prompt" }],
          },
        ],
      })
    );

    // Check result is correct
    expect(result).toBe("test-base64-data");
  });

  it("returns empty string when no image is found in response", async () => {
    // Mock response with no image
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Some text",
                },
              ],
            },
          },
        ],
      },
    });

    const result = await makeGeminiRequest("test prompt");
    expect(result).toBe("");
  });

  it("returns empty string when API call fails", async () => {
    // Mock error
    mockedAxios.post.mockRejectedValueOnce(new Error("API error"));

    const result = await makeGeminiRequest("test prompt");
    expect(result).toBe("");
  });
});

describe("generateMemeDescriptions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("makes a proper API call to Gemini text model", async () => {
    // Mock successful response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Meme description 1\nMeme description 2\nMeme description 3\nMeme description 4",
                },
              ],
            },
          },
        ],
      },
    });

    const result = await generateMemeDescriptions("test topic");

    // Check axios was called correctly
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
      ),
      expect.objectContaining({
        contents: [
          {
            parts: [{ text: expect.stringContaining("Topic: test topic") }],
          },
        ],
      })
    );

    // Check result is correct
    expect(result).toEqual([
      "Meme description 1",
      "Meme description 2",
      "Meme description 3",
      "Meme description 4",
    ]);
  });

  it("returns empty array when no text is found in response", async () => {
    // Mock response with no text
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: "test-base64-data",
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const result = await generateMemeDescriptions("test topic");
    expect(result).toEqual([]);
  });

  it("returns empty array when API call fails", async () => {
    // Mock error
    mockedAxios.post.mockRejectedValueOnce(new Error("API error"));

    const result = await generateMemeDescriptions("test topic");
    expect(result).toEqual([]);
  });
});
