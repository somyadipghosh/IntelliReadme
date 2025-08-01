# README Generator

A professional AI-powered README generator that analyzes GitHub repositories and creates comprehensive documentation.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
4. Add your Google Gemini API key to the `.env` file:
   ```bash
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   Get your API key from: https://makersuite.google.com/app/apikey

5. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- ✨ AI-powered README generation using Google Gemini
- 🎨 Professional templates (Attractive, Detailed, Minimal, Showcase)
- 👁️ Markdown preview functionality
- 📋 Copy to clipboard
- 📥 Download as .md file
- 🌙 GitHub-inspired dark theme
- 📱 Responsive design

## Technologies

- React 18
- Vite
- Tailwind CSS v4
- Google Gemini AI API
- Lucide React Icons

## Security

- API keys are stored in `.env` file (not committed to git)
- CORS handling for GitHub API
- Input validation and error handling
