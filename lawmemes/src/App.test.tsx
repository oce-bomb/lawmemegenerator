import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { makeGeminiRequest, generateMemeDescriptions } from "./services/api";

// Mock the API functions
jest.mock("./services/api", () => ({
  makeGeminiRequest: jest.fn(),
  generateMemeDescriptions: jest.fn(),
}));

// Mock the ImageDisplay component
jest.mock("./components/ImageDisplay", () => {
  return function MockImageDisplay(props: { images: string[] }) {
    return (
      <div data-testid="image-display">
        {props.images.map((img, i) => (
          <div key={i} data-testid={`mock-image-${i}`} />
        ))}
      </div>
    );
  };
});

const mockMakeGeminiRequest = makeGeminiRequest as jest.MockedFunction<
  typeof makeGeminiRequest
>;

const mockGenerateMemeDescriptions =
  generateMemeDescriptions as jest.MockedFunction<
    typeof generateMemeDescriptions
  >;

describe("App Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementation
    mockGenerateMemeDescriptions.mockResolvedValue([
      "Meme description 1",
      "Meme description 2",
      "Meme description 3",
      "Meme description 4",
    ]);
  });

  test("renders textarea input for law meme generation", () => {
    render(<App />);
    const textareaElement = screen.getByPlaceholderText(
      /Input a topic or idea for a law meme/i
    );
    expect(textareaElement).toBeInTheDocument();
  });

  test("handles text input correctly", () => {
    render(<App />);
    const textareaElement = screen.getByPlaceholderText(
      /Input a topic or idea for a law meme/i
    );

    userEvent.type(textareaElement, "contract law");
    expect(textareaElement).toHaveValue("contract law");
  });

  test("displays loading state when form is submitted", async () => {
    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    userEvent.type(textareaElement, "contract law");
    fireEvent.keyDown(textareaElement, { key: "Enter", code: "Enter" });

    // Check if loading indicator appears
    await waitFor(() => {
      const loadingContainer = screen.getByTestId("loading-container");
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  test("handles Enter key to submit the form", async () => {
    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    userEvent.type(textareaElement, "contract law");
    fireEvent.keyDown(textareaElement, { key: "Enter", code: "Enter" });

    // Verify that the API was called
    await waitFor(() => {
      expect(mockMakeGeminiRequest).toHaveBeenCalled();
    });
  });

  test("does not submit form on Enter with Shift key", () => {
    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    userEvent.type(textareaElement, "contract law");
    fireEvent.keyDown(textareaElement, {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
    });

    // Verify that the API was not called
    expect(mockMakeGeminiRequest).not.toHaveBeenCalled();
  });

  test("does not submit form when input is empty", () => {
    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    fireEvent.keyDown(textareaElement, { key: "Enter", code: "Enter" });

    // Verify that the API was not called
    expect(mockMakeGeminiRequest).not.toHaveBeenCalled();
  });

  test("handles API error correctly", async () => {
    // Mock API to throw an error
    mockMakeGeminiRequest.mockRejectedValue(new Error("API error"));

    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    userEvent.type(textareaElement, "contract law");
    fireEvent.keyDown(textareaElement, { key: "Enter", code: "Enter" });

    // Check for error message
    await waitFor(() => {
      const errorMessage = screen.getByTestId("error-message");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/Failed to generate images/i);
    });
  });

  test("displays images after successful API responses", async () => {
    // Mock successful API responses
    mockMakeGeminiRequest.mockResolvedValue("mockBase64Data");

    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    userEvent.type(textareaElement, "contract law");
    fireEvent.keyDown(textareaElement, { key: "Enter", code: "Enter" });

    // Check if images are displayed
    await waitFor(() => {
      const imageDisplay = screen.getByTestId("image-display");
      expect(imageDisplay).toBeInTheDocument();
    });
  });

  test("renders input field", () => {
    render(<App />);
    const inputElement = screen.getByTestId("meme-input");
    expect(inputElement).toBeInTheDocument();
  });

  test("renders the app title", () => {
    render(<App />);
    const titleElement = screen.getByText("Law Meme Generator");
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).toBe("H1");
    expect(titleElement).toHaveAttribute("title", "Refresh page");
  });

  test("app title refreshes page when clicked", () => {
    // Mock window.location.reload
    const originalReload = window.location.reload;
    window.location.reload = jest.fn();

    render(<App />);
    const titleElement = screen.getByTestId("app-title");

    // Click the title
    fireEvent.click(titleElement);

    // Verify reload was called
    expect(window.location.reload).toHaveBeenCalled();

    // Restore original reload function
    window.location.reload = originalReload;
  });

  test("submits form and shows loading state", async () => {
    render(<App />);

    const inputElement = screen.getByTestId("meme-input");
    fireEvent.change(inputElement, { target: { value: "test prompt" } });

    // Submit the form
    fireEvent.keyDown(inputElement, { key: "Enter" });

    // Check if loading state appears
    const loadingElement = await screen.findByTestId("loading-container");
    expect(loadingElement).toBeInTheDocument();

    // Wait for images to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("image-item-0")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("calls generateMemeDescriptions then makeGeminiRequest when form is submitted", async () => {
    // Setup mocks
    mockGenerateMemeDescriptions.mockResolvedValue([
      "Description 1",
      "Description 2",
      "Description 3",
      "Description 4",
    ]);
    mockMakeGeminiRequest.mockResolvedValue("mockBase64Data");

    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    userEvent.type(textareaElement, "contract law");
    fireEvent.keyDown(textareaElement, { key: "Enter", code: "Enter" });

    // Verify API calls order
    await waitFor(() => {
      expect(mockGenerateMemeDescriptions).toHaveBeenCalledWith("contract law");
      expect(mockMakeGeminiRequest).toHaveBeenCalledTimes(4);
      expect(mockMakeGeminiRequest).toHaveBeenCalledWith("Description 1");
      expect(mockMakeGeminiRequest).toHaveBeenCalledWith("Description 2");
      expect(mockMakeGeminiRequest).toHaveBeenCalledWith("Description 3");
      expect(mockMakeGeminiRequest).toHaveBeenCalledWith("Description 4");
    });
  });

  test("handles error when generateMemeDescriptions fails", async () => {
    // Mock API to throw an error
    mockGenerateMemeDescriptions.mockRejectedValue(new Error("API error"));

    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    userEvent.type(textareaElement, "contract law");
    fireEvent.keyDown(textareaElement, { key: "Enter", code: "Enter" });

    // Check for error message
    await waitFor(() => {
      const errorMessage = screen.getByTestId("error-message");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/Failed to generate images/i);
    });

    // Verify makeGeminiRequest was not called
    expect(mockMakeGeminiRequest).not.toHaveBeenCalled();
  });

  test("handles error when generateMemeDescriptions returns empty array", async () => {
    // Mock API to return empty array
    mockGenerateMemeDescriptions.mockResolvedValue([]);

    render(<App />);
    const textareaElement = screen.getByTestId("meme-input");

    userEvent.type(textareaElement, "contract law");
    fireEvent.keyDown(textareaElement, { key: "Enter", code: "Enter" });

    // Check for error message
    await waitFor(() => {
      const errorMessage = screen.getByTestId("error-message");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/Failed to generate images/i);
    });

    // Verify makeGeminiRequest was not called
    expect(mockMakeGeminiRequest).not.toHaveBeenCalled();
  });
});
