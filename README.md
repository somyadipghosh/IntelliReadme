# README.dev - AI-Powered README Generator

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-orange?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Professional README generator powered by AI that analyzes GitHub repositories and creates comprehensive documentation with beautiful templates.**

� **Live Demo**: [README.dev](http://localhost:5173)  
👨‍💻 **Developer**: [Somyadip Ghosh](https://www.somyadip.me/)  
📂 **Repository**: [GitHub](https://github.com/somyadipghosh)

## ✨ Features

- 🤖 **AI-Powered Generation**: Uses Google Gemini AI to create 400-600+ line comprehensive READMEs
- 🎨 **Professional Templates**: 4 carefully designed templates (Attractive, Detailed, Minimal, Showcase)
- 👁️ **Live Preview**: Real-time toggle between raw markdown and rendered preview
- � **GitHub Integration**: Automatically fetches repository data, languages, and structure
- 📋 **Export Options**: Copy to clipboard or download as .md file
- 🌙 **Professional UI**: GitHub-inspired dark theme with responsive design
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development
- 🔧 **Customizable**: Each template adapts to your project's programming language

## � Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | Frontend Framework | 18+ |
| **Vite** | Build Tool | 5.4+ |
| **Tailwind CSS** | Styling Framework | 4.0 |
| **Google Gemini AI** | Content Generation | Latest |
| **GitHub API** | Repository Analysis | v3 |
| **Lucide React** | Icon Library | Latest |

## � Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/somyadipghosh/readme-generator.git
cd readme-generator
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit .env file and add your Gemini API key
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## � Usage Guide

### Step 1: Enter Repository URL
- Paste any GitHub repository URL (e.g., `https://github.com/facebook/react`)
- The system automatically fetches repository details, languages, and structure

### Step 2: Choose Template
Select from 4 professional templates:

- **🎨 Attractive**: Eye-catching with badges, interactive elements (500+ lines)
- **📚 Detailed**: Comprehensive technical documentation (600+ lines)
- **⚡ Minimal**: Clean, focused design (300+ lines)
- **🏆 Showcase**: Perfect for highlighting features and demos (500+ lines)

### Step 3: Generate & Export
- Click "Generate README" to create AI-powered documentation
- Toggle between "Code" and "Preview" modes
- Copy to clipboard or download as `.md` file

## 👨‍💻 Developer

**Somyadip Ghosh**
- 🌐 Portfolio: [somyadip.me](https://www.somyadip.me/)
- 💼 LinkedIn: [somyadipghosh](https://www.linkedin.com/in/somyadipghosh)
- 🐦 Twitter: [@somyadipghosh](https://x.com/somyadipghosh)
- 📸 Instagram: [@somyadipghosh](https://www.instagram.com/somyadipghosh/)
- 💻 GitHub: [@somyadipghosh](https://github.com/somyadipghosh)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## � License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful content generation
- **GitHub API** for repository data access
- **Tailwind CSS** for beautiful styling system
- **Lucide React** for consistent iconography

---

<div align="center">
  <p>Built with ❤️ by <a href="https://www.somyadip.me/">Somyadip Ghosh</a></p>
  <p>© 2025 README.dev. All rights reserved.</p>
</div>
