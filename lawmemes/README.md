# Law Meme Generator

A React-based web application that generates humorous legal memes using Google's Gemini AI API. Perfect for law students, lawyers, and legal professionals looking for a laugh.

## Features

- Generate custom law memes from text prompts
- Uses Gemini's text generation to create creative meme descriptions
- Creates visual memes using Gemini's image generation capabilities
- View generated memes in a responsive grid layout
- Click to enlarge memes and view the full prompt
- Download memes for sharing
- Responsive design for mobile and desktop

## Technology Stack

- React
- TypeScript
- Tailwind CSS
- Google Gemini AI API
- Axios for API requests
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/oce-bomb/lawmemegenerator.git
   cd lawmemegenerator
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Gemini API key:

   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```
   npm start
   ```

5. The app will be available at `http://localhost:3000`

## Usage

1. Enter a legal topic or concept in the input field
2. Press Enter or click Submit to generate memes
3. Wait for the AI to generate your custom law memes
4. View, download, or click to enlarge the generated memes
5. Click the title to refresh the page and start over

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Powered by Google's Gemini AI
- Created for legal professionals with a sense of humor
