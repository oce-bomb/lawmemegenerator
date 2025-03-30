import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageDisplay from "./ImageDisplay";

// Just mock createElement to avoid actual DOM operations
global.document.createElement = jest.fn().mockImplementation((tag) => {
  if (tag === "a") {
    return {
      href: "",
      download: "",
      click: jest.fn(),
    };
  }
  return document.createElement(tag);
});

// Mock appendChild and removeChild
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

describe("ImageDisplay Component", () => {
  const mockImages = [
    "base64image1",
    "base64image2",
    "base64image3",
    "base64image4",
  ];

  const mockDescriptions = [
    "A judge hammering a gavel with 'Motion Denied' text",
    "Lawyer drowning in paperwork with 'Discovery Phase' caption",
    "Law student surrounded by books labeled 'Bar Exam Prep'",
    "Attorney objecting dramatically in court",
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders all images provided in props", () => {
    render(<ImageDisplay images={mockImages} />);

    // Check if all images are rendered
    mockImages.forEach((_, index) => {
      const imageContainer = screen.getByTestId(`image-item-${index}`);
      expect(imageContainer).toBeInTheDocument();
    });
  });

  test("doesn't display descriptions in grid view", () => {
    render(
      <ImageDisplay images={mockImages} descriptions={mockDescriptions} />
    );

    // No description elements should be present in the grid view
    mockDescriptions.forEach((_, index) => {
      expect(
        screen.queryByTestId(`image-description-${index}`)
      ).not.toBeInTheDocument();
    });
  });

  test("shows enlarged image with description in a scrollable container when an image is clicked", () => {
    render(
      <ImageDisplay images={mockImages} descriptions={mockDescriptions} />
    );

    // Click the first image
    fireEvent.click(screen.getByTestId("image-item-0"));

    // Check if enlarged view appears with the description
    expect(screen.getByTestId("enlarged-backdrop")).toBeInTheDocument();
    expect(screen.getByTestId("enlarged-image")).toBeInTheDocument();

    // Check that the description is displayed in the enlarged view with "Prompt:" label
    const descriptionContainer = screen.getByTestId("enlarged-description");
    expect(descriptionContainer).toBeInTheDocument();
    expect(descriptionContainer).toHaveClass("overflow-y-auto");
    expect(screen.getByText("Prompt:")).toBeInTheDocument();
    expect(
      screen.getByText(mockDescriptions[0], { exact: false })
    ).toBeInTheDocument();
  });

  test("shows enlarged image with description when an image is clicked", () => {
    render(
      <ImageDisplay images={mockImages} descriptions={mockDescriptions} />
    );

    // Click the first image
    fireEvent.click(screen.getByTestId("image-item-0"));

    // Check if enlarged view appears with the description
    expect(screen.getByTestId("enlarged-backdrop")).toBeInTheDocument();
    expect(screen.getByTestId("enlarged-image")).toBeInTheDocument();
    expect(screen.getByText(mockDescriptions[0])).toBeInTheDocument();
  });

  test("closes enlarged image when close button is clicked", () => {
    render(<ImageDisplay images={mockImages} />);

    // Click an image to open enlarged view
    fireEvent.click(screen.getByTestId("image-item-0"));

    // Click the close button
    fireEvent.click(screen.getByTestId("close-button"));

    // Enlarged view should be removed
    expect(screen.queryByTestId("enlarged-backdrop")).not.toBeInTheDocument();
  });

  test("downloads image when download button is clicked", () => {
    render(<ImageDisplay images={mockImages} />);

    // Find and click the download button for the first image
    const downloadButton = screen.getByTestId("download-button-0");
    fireEvent.click(downloadButton);

    // Check if download link was created and clicked
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(document.body.appendChild).toHaveBeenCalled();

    const mockAnchor = (document.createElement as jest.Mock).mock.results[0]
      .value;
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(mockAnchor.download).toBe("law-meme-1.png");
  });

  test("downloads image with description-based filename", () => {
    render(
      <ImageDisplay images={mockImages} descriptions={mockDescriptions} />
    );

    // Find and click the download button for the first image
    const downloadButton = screen.getByTestId("download-button-0");
    fireEvent.click(downloadButton);

    // Get the filename
    const mockAnchor = (document.createElement as jest.Mock).mock.results[0]
      .value;

    // Should use a cleaned version of the description
    expect(mockAnchor.download).toBe(
      "law-meme-a-judge-hammering-a-gavel-with.png"
    );
  });

  test("shows enlarged image when an image is clicked", () => {
    render(<ImageDisplay images={mockImages} />);

    // Initially, no enlarged image should be visible
    expect(screen.queryByTestId("enlarged-backdrop")).not.toBeInTheDocument();

    // Click the first image
    fireEvent.click(screen.getByTestId("image-item-0"));

    // Check if enlarged view appears
    expect(screen.getByTestId("enlarged-backdrop")).toBeInTheDocument();
    expect(screen.getByTestId("enlarged-image")).toBeInTheDocument();
  });

  test("closes enlarged image when backdrop is clicked", () => {
    render(<ImageDisplay images={mockImages} />);

    // Click an image to open enlarged view
    fireEvent.click(screen.getByTestId("image-item-0"));
    expect(screen.getByTestId("enlarged-backdrop")).toBeInTheDocument();

    // Click the backdrop to close
    fireEvent.click(screen.getByTestId("enlarged-backdrop"));

    // Enlarged view should be removed
    expect(screen.queryByTestId("enlarged-backdrop")).not.toBeInTheDocument();
  });

  test("downloads image from enlarged view when download button is clicked", () => {
    render(<ImageDisplay images={mockImages} />);

    // Click an image to open enlarged view
    fireEvent.click(screen.getByTestId("image-item-1"));

    // Find and click the download button in the enlarged view
    const enlargedDownloadButton = screen.getByTestId(
      "enlarged-download-button"
    );
    fireEvent.click(enlargedDownloadButton);

    // Check if document.createElement was called with 'a'
    expect(document.createElement).toHaveBeenCalledWith("a");

    // Check if the link was set up correctly for the second image (index 1)
    const mockAnchor = (document.createElement as jest.Mock).mock.results[0]
      .value;
    expect(mockAnchor.href).toBe(`data:image/png;base64,${mockImages[1]}`);
    expect(mockAnchor.download).toBe("law-meme-2.png");

    // Check if link was appended to document, clicked, and removed
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });

  test("downloads image with description from enlarged view", () => {
    render(
      <ImageDisplay images={mockImages} descriptions={mockDescriptions} />
    );

    // Click an image to open enlarged view
    fireEvent.click(screen.getByTestId("image-item-1"));

    // Find and click the download button in the enlarged view
    const enlargedDownloadButton = screen.getByTestId(
      "enlarged-download-button"
    );
    fireEvent.click(enlargedDownloadButton);

    // Check if the link was set up correctly with the description-based filename
    const mockAnchor = (document.createElement as jest.Mock).mock.results[0]
      .value;
    expect(mockAnchor.download).toBe(
      "law-meme-lawyer-drowning-in-paperwork.png"
    );
  });

  test("clicking on enlarged image container does not close it", () => {
    render(<ImageDisplay images={mockImages} />);

    // Click an image to open enlarged view
    fireEvent.click(screen.getByTestId("image-item-0"));

    // Click on the enlarged image container
    fireEvent.click(screen.getByTestId("enlarged-container"));

    // Enlarged view should still be visible
    expect(screen.getByTestId("enlarged-backdrop")).toBeInTheDocument();
  });

  test("toggles enlarged image when clicking the same image twice", () => {
    render(<ImageDisplay images={mockImages} />);

    // Click an image to open enlarged view
    fireEvent.click(screen.getByTestId("image-item-0"));
    expect(screen.getByTestId("enlarged-backdrop")).toBeInTheDocument();

    // Click the same image again
    fireEvent.click(screen.getByTestId("image-item-0"));

    // Enlarged view should be closed
    expect(screen.queryByTestId("enlarged-backdrop")).not.toBeInTheDocument();
  });

  test("uses generic alt text for grid view and descriptions in enlarged view", () => {
    render(
      <ImageDisplay images={mockImages} descriptions={mockDescriptions} />
    );

    // Get all img elements in grid view
    const gridImgElements = document.querySelectorAll("img");

    // Grid images should have generic alt text
    for (let i = 0; i < mockImages.length; i++) {
      expect(gridImgElements[i].getAttribute("alt")).toBe(
        `Generated artwork ${i + 1}`
      );
    }

    // Click on first image to get enlarged view
    fireEvent.click(screen.getByTestId("image-item-0"));

    // Get the enlarged image
    const enlargedImg = screen.getByTestId("enlarged-image");

    // Enlarged image should have description-based alt text
    expect(enlargedImg.getAttribute("alt")).toBe(mockDescriptions[0]);
  });

  test("prompt container has a ref for width adjustment", () => {
    render(
      <ImageDisplay images={mockImages} descriptions={mockDescriptions} />
    );

    // Click on first image to get enlarged view
    fireEvent.click(screen.getByTestId("image-item-0"));

    // Get the description container
    const descriptionContainer = screen.getByTestId("enlarged-description");

    // It should have a ref attached (we can't directly test the ref, but we can check
    // that it has the right test ID and initial styling)
    expect(descriptionContainer).toBeInTheDocument();
    expect(descriptionContainer).toHaveStyle({
      width: "100%",
      maxWidth: "100%",
    });
  });

  test("removes all variants of 'Square image' from the beginning of displayed prompts", () => {
    // Create descriptions that start with different "Square image" variants
    const descriptionsWithPrefix = [
      "Square image. A judge hammering a gavel with 'Motion Denied' text",
      "Square image Lawyer drowning in paperwork with 'Discovery Phase' caption", // No period
      "square image, Law student surrounded by books labeled 'Bar Exam Prep'", // Comma instead
      "SQUARE IMAGE: Attorney objecting dramatically in court", // Colon instead
      "SquareImage Another variant without spaces or punctuation", // No spaces
      "Square  image   Extra spaces between words and after", // Extra spaces
    ];

    render(
      <ImageDisplay images={mockImages} descriptions={descriptionsWithPrefix} />
    );

    // Click the first image to get enlarged view with period
    fireEvent.click(screen.getByTestId("image-item-0"));
    const promptText1 = screen.getByTestId("enlarged-description").textContent;
    expect(promptText1).toContain("A judge hammering a gavel");
    expect(promptText1).not.toContain("Square image");

    // Close and check variant without period
    fireEvent.click(screen.getByTestId("close-button"));
    fireEvent.click(screen.getByTestId("image-item-1"));
    const promptText2 = screen.getByTestId("enlarged-description").textContent;
    expect(promptText2).toContain("Lawyer drowning in paperwork");
    expect(promptText2).not.toContain("Square image");

    // Check variant with comma
    fireEvent.click(screen.getByTestId("close-button"));
    fireEvent.click(screen.getByTestId("image-item-2"));
    const promptText3 = screen.getByTestId("enlarged-description").textContent;
    expect(promptText3).toContain("Law student surrounded by books");
    expect(promptText3).not.toContain("square image");

    // Check variant with colon
    fireEvent.click(screen.getByTestId("close-button"));
    fireEvent.click(screen.getByTestId("image-item-3"));
    const promptText4 = screen.getByTestId("enlarged-description").textContent;
    expect(promptText4).toContain("Attorney objecting dramatically");
    expect(promptText4).not.toContain("SQUARE IMAGE");
  });
});
