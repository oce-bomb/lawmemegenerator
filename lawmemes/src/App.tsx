import React, { useState, useRef, useEffect } from "react";
import ImageDisplay from "./components/ImageDisplay";
import { makeGeminiRequest, generateMemeDescriptions } from "./services/api";
import { GEMINI_API_KEY } from "./constants";

function App() {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check for API key on component mount
  useEffect(() => {
    if (!GEMINI_API_KEY) {
      setError(
        "API key is missing. Please check your .env or .env.local file and make sure REACT_APP_GEMINI_API_KEY is set."
      );
    }
  }, []);

  // Resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Important: Reset to a minimal height first before calculating
      textareaRef.current.style.height = "auto";

      // Then set to the exact content height
      const scrollHeight = textareaRef.current.scrollHeight;

      // Calculate the height of a single line (approx)
      const lineHeight = 1.2 * 16; // lineHeight * fontSize

      // Limit to 6 lines maximum
      const maxHeight = lineHeight * 6;

      // Apply height with limit
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight
      )}px`;

      // Add scrollbar if content exceeds max height
      textareaRef.current.style.overflowY =
        scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [text]);

  // Effect for loading animation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading && loadingProgress < 30) {
      // Start the loading progress animation, but only up to 30%
      // The first 30% represents generating descriptions
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          // Slow down as we approach 30%
          const increment = Math.max(0.5, (30 - prev) / 10);
          return Math.min(30, prev + increment);
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, loadingProgress]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    if (!GEMINI_API_KEY) {
      setError(
        "API key is missing. Please check your .env or .env.local file and make sure REACT_APP_GEMINI_API_KEY is set."
      );
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setError(null);
    setImages([]);
    setDescriptions([]);
    setShowResults(false);

    try {
      // Step 1: Generate meme descriptions using Gemini text model
      const memeDescriptions = await generateMemeDescriptions(text);

      if (memeDescriptions.length === 0) {
        throw new Error("Failed to generate meme descriptions");
      }

      // Log the descriptions
      console.log("Generated meme descriptions:", memeDescriptions);

      // Store the descriptions
      setDescriptions(memeDescriptions);

      // Update loading progress to indicate descriptions were generated
      setLoadingProgress(30);

      // Step 2: Use these descriptions to generate images
      const imagePromises = memeDescriptions.map((description) =>
        makeGeminiRequest(description)
      );

      // Track individual image completions to update progress
      const generatedImages: string[] = [];

      // Use Promise.all, but with tracking for each completion
      for (let i = 0; i < imagePromises.length; i++) {
        try {
          const imageData = await imagePromises[i];
          generatedImages.push(imageData);

          // Update loading progress based on completed images
          // Each image represents an additional portion of the remaining 70%
          const progressIncrement = 70 / imagePromises.length;
          setLoadingProgress(30 + progressIncrement * generatedImages.length);
        } catch (error) {
          console.error(`Error with image ${i + 1}:`, error);
          generatedImages.push(""); // Add empty string as placeholder for failed images
        }
      }

      // Complete the loading progress
      setLoadingProgress(100);

      // Slight delay before showing results for smooth transition
      setTimeout(() => {
        // Filter out any failed images and their descriptions
        const validImages = generatedImages.filter((img) => img !== "");
        const validDescriptions = memeDescriptions.filter(
          (_, index) => generatedImages[index] !== ""
        );

        setImages(validImages);
        setDescriptions(validDescriptions);
        setIsLoading(false);
        setShowResults(true);
      }, 500);
    } catch (err) {
      console.error("Error generating images:", err);
      setError("Failed to generate images. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      if (text.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-off-white font-serif relative">
      {/* Title in top left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <h1
          className="text-sm sm:text-base md:text-lg font-serif font-medium text-gray-700 opacity-90 tracking-wide bg-white bg-opacity-50 backdrop-blur-sm shadow-sm px-3 py-1.5 rounded-lg cursor-pointer hover:bg-opacity-70 transition-all duration-200"
          onClick={() => window.location.reload()}
          title="Refresh page"
          data-testid="app-title"
        >
          Law Meme Generator
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-4/5 md:w-3/5 lg:w-2/5 mb-4 sm:mb-8"
      >
        <div
          className={`rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm transition-all duration-300 ease-in-out bg-white
            ${
              isFocused
                ? "ring-2 ring-gray-300"
                : "hover:ring-1 hover:ring-gray-200"
            }`}
        >
          <div className="flex items-center">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent resize-none focus:outline-none p-0 m-0 font-serif text-lg overflow-hidden leading-tight align-middle block"
              placeholder="Input a topic or idea for an NZ law meme"
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{
                display: "block",
                lineHeight: 1.2,
                transition: "height 0.3s ease-in-out",
                minHeight: "1.2em",
                maxHeight: "calc(1.2em * 6)", // Approx 6 lines
                verticalAlign: "middle",
                paddingTop: 0,
                paddingBottom: 0,
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              data-testid="meme-input"
            />
          </div>
        </div>
      </form>

      {error && (
        <div
          className="w-4/5 md:w-3/5 lg:w-2/5 text-red-500 mb-3 sm:mb-4 text-center"
          data-testid="error-message"
        >
          {error}
        </div>
      )}

      {isLoading && (
        <div
          className="w-4/5 md:w-3/5 lg:w-2/5 mt-1 sm:mt-2 mb-3 sm:mb-4"
          data-testid="loading-container"
        >
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${loadingProgress}%` }}
              data-testid="loading-progress"
            ></div>
          </div>
        </div>
      )}

      {showResults && (
        <ImageDisplay images={images} descriptions={descriptions} />
      )}
    </div>
  );
}

export default App;
