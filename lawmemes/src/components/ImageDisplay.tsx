import React, { useState, useRef, useEffect } from "react";

interface ImageDisplayProps {
  images: string[];
  descriptions?: string[];
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  images,
  descriptions = [],
}) => {
  const [enlargedImage, setEnlargedImage] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  // Handle image click to enlarge
  const handleImageClick = (index: number) => {
    setEnlargedImage(enlargedImage === index ? null : index);
  };

  // Close enlarged image when clicking backdrop
  const handleBackdropClick = () => {
    setEnlargedImage(null);
  };

  // Effect to adjust caption width to match image width
  useEffect(() => {
    if (enlargedImage !== null) {
      const adjustCaptionWidth = () => {
        // Only run if refs are available
        if (!imageRef.current || !captionRef.current) return;

        const imageWidth = imageRef.current.offsetWidth;
        if (imageWidth > 0) {
          // Apply both width and max-width to ensure consistency
          captionRef.current.style.width = `${imageWidth}px`;
          captionRef.current.style.maxWidth = `${imageWidth}px`;

          // Also set a data attribute for debugging if needed
          captionRef.current.dataset.adjustedWidth = `${imageWidth}`;
        }
      };

      // Create a ResizeObserver to watch the image for size changes
      const resizeObserver = new ResizeObserver(() => {
        adjustCaptionWidth();
      });

      // Run initial adjustment after a slight delay to ensure rendering
      const initialDelay = setTimeout(adjustCaptionWidth, 50);

      // Add a second adjustment with longer delay as backup
      const secondDelay = setTimeout(adjustCaptionWidth, 250);

      // Apply ResizeObserver to the image if available
      if (imageRef.current) {
        resizeObserver.observe(imageRef.current);
      }

      // Also listen for window resize events
      window.addEventListener("resize", adjustCaptionWidth);

      // Cleanup function
      return () => {
        clearTimeout(initialDelay);
        clearTimeout(secondDelay);
        resizeObserver.disconnect();
        window.removeEventListener("resize", adjustCaptionWidth);
      };
    }
  }, [enlargedImage]);

  // Handle image download
  const handleDownload = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click (image enlargement)

    if (index >= 0 && index < images.length) {
      const imageData = images[index];
      const description = descriptions[index];

      // Generate a filename based on the description or a default name
      let filename = "law-meme";
      if (description) {
        // Convert description to a valid filename (remove special chars, limit length)
        const cleanDescription = description
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .substring(0, 30); // Limit length

        filename = `law-meme-${cleanDescription}`;
      } else {
        filename = `law-meme-${index + 1}`;
      }

      const link = document.createElement("a");
      link.href = `data:image/png;base64,${imageData}`;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className="w-4/5 md:w-3/5 lg:w-2/5 grid grid-cols-2 gap-2 sm:gap-4 animate-fade-in relative">
        {images.map((imageData, index) => (
          <div key={index} className="flex flex-col">
            <div
              className={`
                relative 
                aspect-square 
                bg-gray-100 
                rounded-lg 
                shadow-sm 
                animate-box-appear 
                overflow-hidden 
                cursor-pointer
                transition-all 
                duration-300 
                ease-in-out
                group
                hover:shadow-md
              `}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => handleImageClick(index)}
              data-testid={`image-item-${index}`}
            >
              <img
                src={`data:image/png;base64,${imageData}`}
                alt={`Generated artwork ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Download button that appears on hover */}
              <div
                className={`
                  absolute 
                  bottom-2 
                  left-2
                  sm:bottom-3 
                  sm:left-3 
                  opacity-0 
                  group-hover:opacity-100
                  transition-opacity 
                  duration-300 
                  ease-in-out
                `}
                data-testid={`download-button-container-${index}`}
              >
                <button
                  onClick={(e) => handleDownload(index, e)}
                  className="
                    bg-gray-800 
                    bg-opacity-70 
                    hover:bg-opacity-90 
                    text-white 
                    p-1.5
                    sm:p-2 
                    rounded-full 
                    shadow-md 
                    transition-all 
                    duration-200
                    flex
                    items-center
                    justify-center
                    animate-button-appear
                  "
                  aria-label="Download image"
                  data-testid={`download-button-${index}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sm:w-5 sm:h-5"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Semi-transparent backdrop when an image is enlarged */}
      {enlargedImage !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 animate-fade-in flex items-center justify-center"
          onClick={handleBackdropClick}
          data-testid="enlarged-backdrop"
        >
          {/* Enlarged image container - better positioning for mobile and desktop */}
          <div
            className="relative max-w-2xl max-h-[90vh] w-[90%] sm:w-auto animate-enlarge px-4 flex flex-col items-center justify-start pb-2 pt-10 sm:pt-4"
            style={{ marginTop: "-5vh" }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
            data-testid="enlarged-container"
          >
            {/* Image container */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <img
                ref={imageRef}
                src={`data:image/png;base64,${images[enlargedImage]}`}
                alt={
                  descriptions[enlargedImage] ||
                  `Enlarged artwork ${enlargedImage + 1}`
                }
                className="w-full object-contain rounded-lg max-h-[70vh] sm:max-h-[75vh]"
                data-testid="enlarged-image"
              />
            </div>

            {/* Updated caption for enlarged image - width dynamically matched to image */}
            {descriptions[enlargedImage] && (
              <div
                ref={captionRef}
                className="mt-1 p-2 bg-white bg-opacity-90 rounded-md text-black overflow-y-auto max-h-[10vh] sm:max-h-[8vh] shadow-md text-xs sm:text-sm"
                data-testid="enlarged-description"
                style={{ width: "100%", maxWidth: "100%" }} // Initial style before the ref updates it
              >
                <p className="leading-tight break-words">
                  <span className="font-semibold">Prompt: </span>
                  {descriptions[enlargedImage]
                    // First remove with space between words
                    .replace(/^square\s+image[.:,]?\s*/i, "")
                    // Then try without space between words
                    .replace(/^squareimage[.:,]?\s*/i, "")
                    // Trim in case there are leading spaces after removal
                    .trim()}
                </p>
              </div>
            )}
          </div>

          {/* Top right buttons container */}
          <div className="absolute top-2 sm:top-6 right-2 sm:right-6 flex space-x-2 sm:space-x-3 z-10">
            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(enlargedImage, e);
              }}
              className="
                bg-gray-800 
                bg-opacity-80 
                hover:bg-opacity-100 
                text-white 
                p-2 sm:p-3 
                rounded-full 
                shadow-lg
                transition-all 
                duration-200
                flex
                items-center
                justify-center
                animate-button-appear
              "
              aria-label="Download enlarged image"
              data-testid="enlarged-download-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-6 sm:h-6"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>

            {/* Close button */}
            <button
              className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-3 rounded-full text-white shadow-lg transition-all duration-200"
              onClick={handleBackdropClick}
              data-testid="close-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-6 sm:h-6"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageDisplay;
