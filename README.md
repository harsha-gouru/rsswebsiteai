# Retro RSS Reader

A modern RSS feed reader with a retro aesthetic and AI-powered features. Stay updated with your favorite feeds while getting intelligent summaries, analysis, and recommendations.

![Retro RSS Reader](public/placeholder-logo.svg)

## Features

### Core Functionality
- **Feed Management**: Add, remove, and organize your RSS feeds
- **Article Reader**: Read articles directly within the app
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-Refresh**: Automatically checks for new content

### AI-Powered Features
- **Article Summaries**: Get AI-generated summaries of articles
- **Content Analysis**: Analyze articles for key topics, sentiment, and reading time
- **Smart Recommendations**: Receive personalized article recommendations based on your reading habits
- **Preference Learning**: Set reading preferences to tailor your experience

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/retro-rss-reader.git
cd retro-rss-reader
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up your environment:
Create a `.env.local` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and go to http://localhost:3000

## Usage

### Adding a Feed
1. Click the "Add Feed" button in the feeds sidebar
2. Enter the RSS feed URL (e.g., https://example.com/feed.xml)
3. Optionally provide a custom title (or let the app detect it automatically)
4. Click "Add Feed"

### Reading Articles
1. Select a feed from the sidebar
2. Browse through the list of articles
3. Click on an article to view its content
4. Use the tabs to view AI-generated summaries and analysis

### Customizing Preferences
1. Click the "Preferences" button
2. Set your preferred categories, reading level, and interests
3. This information will be used to enhance your recommendations

## Technology Stack

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **AI Features**: OpenAI API
- **RSS Parsing**: rss-parser
- **State Management**: React hooks

## Development

### Available Scripts
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI features powered by [OpenAI](https://openai.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
