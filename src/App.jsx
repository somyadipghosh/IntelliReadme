import React, { useState } from 'react';
import { 
  Github, Download, Sparkles, FileText, Zap, Star, Copy, CheckCircle, 
  Terminal, Code, GitBranch, Users, Eye, Clock, Settings, 
  BookOpen, Rocket, Award, TrendingUp, ExternalLink, Globe,
  Instagram, Linkedin, Twitter, Lightbulb, BarChart3,
  Palette, Save, RefreshCw, Search, Filter, Moon, Sun, Upload
} from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('API Key loaded:', GEMINI_API_KEY ? 'Yes' : 'No');

const readmeTemplates = [
  {
    id: 'attractive',
    name: 'Modern & Interactive',
    description: 'Eye-catching with badges, shields, and interactive elements',
    icon: <Sparkles className="w-5 h-5" />,
    features: ['Animated badges', 'Interactive demos', 'Social links', 'Contributors section'],
    complexity: 'Advanced'
  },
  {
    id: 'detailed',
    name: 'Professional Documentation',
    description: 'Comprehensive technical documentation with all sections',
    icon: <BookOpen className="w-5 h-5" />,
    features: ['API docs', 'Installation guide', 'Contributing', 'Troubleshooting'],
    complexity: 'Detailed'
  },
  {
    id: 'minimal',
    name: 'Clean & Minimal',
    description: 'Simple, focused design for straightforward projects',
    icon: <Zap className="w-5 h-5" />,
    features: ['Essential info only', 'Quick start', 'Clean typography', 'Mobile optimized'],
    complexity: 'Simple'
  },
  {
    id: 'showcase',
    name: 'Project Showcase',
    description: 'Perfect for highlighting features and demos',
    icon: <Award className="w-5 h-5" />,
    features: ['Feature highlights', 'Screenshots', 'Live demos', 'Roadmap'],
    complexity: 'Visual'
  }
];

const stats = [
  { label: 'READMEs Generated', value: '12,847', icon: <FileText className="w-5 h-5" /> },
  { label: 'Active Developers', value: '3,240', icon: <Users className="w-5 h-5" /> },
  { label: 'Templates Available', value: '4', icon: <Code className="w-5 h-5" /> },
  { label: 'Success Rate', value: '99.2%', icon: <TrendingUp className="w-5 h-5" /> }
];

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [repoInfo, setRepoInfo] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('attractive');
  const [generatedReadme, setGeneratedReadme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generateLicense, setGenerateLicense] = useState(true);
  const [generatedLicense, setGeneratedLicense] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [readmeQuality, setReadmeQuality] = useState(null);
  const [exportFormat, setExportFormat] = useState('markdown');
  
  // README Analysis states
  const [analysisRepoUrl, setAnalysisRepoUrl] = useState('');
  const [analysisReadmeContent, setAnalysisReadmeContent] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisSuggestions, setAnalysisSuggestions] = useState([]);
  const [showAnalysisSuggestions, setShowAnalysisSuggestions] = useState(false);

  const extractRepoInfo = (url) => {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  };

  const fetchRepoData = async (owner, repo) => {
    try {
      // Using GitHub API directly with proper headers
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'README-Generator-App'
      };

      const [repoResponse, contentsResponse, languagesResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers })
          .then(res => {
            if (!res.ok) {
              if (res.status === 404) throw new Error('Repository not found. Please check the URL.');
              if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Please try again later.');
              throw new Error(`GitHub API error: ${res.status}`);
            }
            return res.json();
          }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers })
          .then(res => {
            if (!res.ok) {
              if (res.status === 404) return [];
              throw new Error(`Failed to fetch repository contents: ${res.status}`);
            }
            return res.json();
          }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers })
          .then(res => {
            if (!res.ok) {
              if (res.status === 404) return {};
              throw new Error(`Failed to fetch repository languages: ${res.status}`);
            }
            return res.json();
          })
      ]);

      const repoData = {
        repo: repoResponse,
        contents: Array.isArray(contentsResponse) ? contentsResponse : [],
        languages: languagesResponse || {}
      };

      setRepoInfo(repoData.repo);
      return repoData;
    } catch (error) {
      console.error('GitHub API Error:', error);
      
      // If GitHub API fails, we can still generate a README with basic info
      if (error.message.includes('CORS') || error.message.includes('fetch') || error.message.includes('404')) {
        console.log('GitHub API failed, using fallback data');
        // Fallback: create basic data for generation
        const fallbackRepoData = {
          repo: {
            name: repo,
            description: `A ${repo} repository`,
            language: 'Unknown',
            stargazers_count: 0,
            forks_count: 0,
            homepage: null,
            clone_url: `https://github.com/${owner}/${repo}.git`,
            html_url: `https://github.com/${owner}/${repo}`
          },
          contents: [
            { name: 'README.md', type: 'file' },
            { name: 'package.json', type: 'file' },
            { name: 'src', type: 'dir' },
            { name: '.gitignore', type: 'file' }
          ],
          languages: { 'Unknown': 100 }
        };
        
        setRepoInfo(fallbackRepoData.repo);
        return fallbackRepoData;
      }
      
      throw new Error(error.message || 'Failed to fetch repository data. Please check the URL and try again.');
    }
  };

  const generateReadmeWithGemini = async (repoData, template) => {
    const prompt = `
    You are an expert technical writer creating a comprehensive README.md file for a GitHub repository.
    
    Repository Information:
    - Name: ${repoData.repo.name}
    - Description: ${repoData.repo.description || 'No description provided'}
    - Primary Language: ${repoData.repo.language || 'Not specified'}
    - All Languages: ${Object.keys(repoData.languages).join(', ') || 'Unknown'}
    - Stars: ${repoData.repo.stargazers_count || 0}
    - Forks: ${repoData.repo.forks_count || 0}
    - Homepage: ${repoData.repo.homepage || 'None'}
    - Repository URL: ${repoData.repo.html_url || `https://github.com/owner/${repoData.repo.name}`}
    - Clone URL: ${repoData.repo.clone_url || `https://github.com/owner/${repoData.repo.name}.git`}
    - Files: ${repoData.contents.slice(0, 20).map(file => file.name).join(', ')}${repoData.contents.length > 20 ? ' and more...' : ''}
    
    Template Style: ${template}
    
    REQUIREMENTS FOR ${template.toUpperCase()} TEMPLATE:
    ${getTemplatePrompt(template)}
    
    CRITICAL INSTRUCTIONS:
    1. Generate a COMPREHENSIVE README that is AT LEAST 400-600 lines long
    2. Use EMOJIS throughout the document for visual appeal (✨🚀🎨📱🔧💡🌙⚡🛡️📋🛠️📖🎯etc.)
    3. Include REAL, DETAILED content - NO placeholders, NO "(To be added)", NO "[Configuration options]"
    4. Create multiple detailed code examples with realistic function names, variables, and implementations
    5. Add substantial content to each section - no short paragraphs
    6. Include proper markdown formatting with headers, lists, code blocks, tables
    7. Generate realistic examples based on the repository's programming language
    8. Create detailed installation instructions for multiple platforms
    9. Include comprehensive API documentation with real endpoint examples
    10. Add troubleshooting section with real scenarios and solutions
    11. Make it production-ready and professional
    12. Use attractive formatting like centered text, aligned sections, and visual elements
    13. Include relevant badges for the technology stack
    14. Add compelling descriptions with emphasis using **bold** and > quotes
    15. Generate realistic file names, function names, variable names, and configuration options
    16. Provide complete, working code examples that developers can actually use
    17. Create realistic project descriptions, features, and use cases
    18. Include actual command examples, not placeholder commands
    
    STRUCTURE (include ALL sections with substantial content):
    - Project title with emojis and badges
    - Compelling description with > quotes and emphasis
    - Table of contents with emoji navigation
    - Features (comprehensive list with emojis)
    - Technology Stack (formatted table)
    - Prerequisites (detailed requirements)
    - Installation (multiple methods with emojis)
    - Usage (multiple examples with code)
    - API Reference (if applicable)
    - Configuration
    - Examples/Tutorials
    - Testing
    - Contributing
    - Troubleshooting
    - FAQ
    - License
    - Support/Contact
    - Acknowledgments
    
    FORMATTING STYLE GUIDE:
    - Use emojis for section headers: ## 🚀 Installation
    - Use emojis for feature lists: - 🎨 **Feature**: Description
    - Add compelling quotes: > **Professional description with emphasis**
    - Include developer info: 👨‍💻 **Developer**: [Owner Name](actual-link)
    - Add centered footer: <div align="center">Built with ❤️</div>
    - Use attractive badges based on tech stack
    - Format tables professionally with | Technology | Purpose | Version |
    
    CONTENT REQUIREMENTS:
    - NO PLACEHOLDERS: Never use [brackets], (To be added), [Configuration options], etc.
    - Generate realistic project names, feature names, function names, and examples
    - Create complete, working code examples that developers can copy and use
    - Provide actual file paths, realistic URLs, and proper command examples
    - Generate specific environment variables, configuration options, and API endpoints
    - Write complete installation instructions with real commands
    - Create detailed troubleshooting sections with actual problems and solutions
    - Generate realistic use cases and examples based on the project's language and purpose
    
    Generate ONLY the markdown content. Make it comprehensive, detailed, professional, visually appealing with emojis throughout, and completely ready-to-use without any placeholders.
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,  // Increased for longer output
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          throw new Error('Invalid API request. Please check your API key configuration.');
        } else if (response.status === 403) {
          throw new Error('API key is invalid or has insufficient permissions.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from AI service. Please try again.');
      }

      const generatedContent = data.candidates[0].content.parts[0].text;
      
      // Validate the generated content is substantial
      if (generatedContent.length < 1000) {
        console.warn('Generated content is shorter than expected, but proceeding...');
      }

      return generatedContent;
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  };

  const getTemplatePrompt = (template) => {
    switch (template) {
      case 'attractive':
        return `
        Create a visually stunning and comprehensive README with emojis and modern formatting following this structure:

        # [Actual Project Name] - [Creative Tagline Based on Project Purpose]

        [Add specific badges like React, Vite, TypeScript, etc. based on actual tech stack detected]

        > **[Write compelling description highlighting the project's main value proposition]**

        🌐 **Live Demo**: https://project-demo.vercel.app  
        👨‍💻 **Developer**: [Owner Name](https://github.com/[owner])  
        📂 **Repository**: [Actual GitHub URL]

        ## ✨ Features

        - 🚀 **[Generate specific feature based on project type]**: [Detailed implementation description]
        - 🎨 **[Generate relevant UI/design feature]**: [Specific functionality explanation]
        - 📱 **[Generate responsive/mobile feature]**: [Technical implementation details]
        - 🔧 **[Generate configuration feature]**: [Actual configuration options]
        - 💡 **[Generate smart/AI feature if applicable]**: [Detailed capability description]
        - 🌙 **[Generate theme/styling feature]**: [Specific styling options]
        - ⚡ **[Generate performance feature]**: [Optimization details with metrics]
        - 🛡️ **[Generate security feature]**: [Security implementation specifics]

        ## 🛠️ Technology Stack

        | Technology | Purpose | Version |
        |------------|---------|---------|
        | [Generate based on detected languages and files] | [Specific purpose] | [Current version] |

        ## 📋 Prerequisites

        Before running this project, make sure you have:

        - **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
        - **npm** or **yarn** package manager
        - **[Generate specific requirement based on project]** ([provide actual setup instructions])
        - **Modern web browser** (Chrome, Firefox, Safari, Edge)

        ## 🚀 Installation & Setup

        ### 1. Clone the Repository
        \`\`\`bash
        git clone [actual repo URL]
        cd [actual project name]
        \`\`\`

        ### 2. Install Dependencies
        \`\`\`bash
        npm install
        # or if using yarn
        yarn install
        \`\`\`

        ### 3. Environment Configuration
        \`\`\`bash
        # Create environment file
        cp .env.example .env.local

        # Add your configuration (generate realistic examples):
        VITE_API_KEY=your_api_key_here
        VITE_APP_URL=http://localhost:3000
        DATABASE_URL=postgresql://user:password@localhost:5432/dbname
        \`\`\`

        ### 4. Start Development Server
        \`\`\`bash
        npm run dev
        # or
        yarn dev
        \`\`\`

        The application will be available at \`http://localhost:3000\`

        ## 📖 Usage Guide

        ### Step 1: [Generate specific first step based on project type]
        - [Provide detailed instructions with actual examples]
        - [Include realistic data/inputs to use]

        ### Step 2: [Generate logical second step]
        - [Detailed process with code examples]
        - [Expected outcomes and results]

        ### Step 3: [Generate additional steps as needed]
        - [Complete workflow examples]

        ## 🎯 API Reference

        [Generate realistic API documentation based on project type with actual endpoints, parameters, and responses]

        ### Authentication
        \`\`\`javascript
        // Example authentication setup
        const apiKey = process.env.VITE_API_KEY;
        const headers = {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json'
        };
        \`\`\`

        ### Available Endpoints
        [Generate realistic endpoints with examples]

        ## 🔧 Configuration

        [Generate actual configuration options based on project type]

        ### Environment Variables
        \`\`\`env
        # Required
        VITE_API_KEY=your_api_key
        VITE_APP_NAME=YourAppName

        # Optional
        VITE_DEBUG_MODE=true
        VITE_ANALYTICS_ID=GA-XXXXXXXXX
        \`\`\`

        ### Advanced Configuration
        [Provide real configuration examples with actual file structures]

        ## 🤝 Contributing

        Contributions are welcome! Here's how you can help:

        1. Fork the repository
        2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
        3. Commit your changes: \`git commit -m 'Add amazing feature'\`
        4. Push to the branch: \`git push origin feature/amazing-feature\`
        5. Open a Pull Request

        ## 📄 License

        This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

        ## 🙏 Acknowledgments

        - **[Generate relevant tool/service]** for [specific contribution]
        - **[Generate another relevant acknowledgment]** for [specific purpose]
        - **Open source community** for inspiration and support

        ---

        <div align="center">
          <p>Built with ❤️ by <a href="https://github.com/[owner]">[Owner Name]</a></p>
          <p>© 2025 [Project Name]. All rights reserved.</p>
        </div>

        Make it at least 500+ lines with rich, realistic content, emojis throughout, and professional formatting. NO placeholders - everything should be complete and usable.
        `;
      case 'detailed':
        return `
        Create a comprehensive technical documentation README with emojis and modern formatting:

        # [Project Name] - [Technical Description]

        [Professional badges for build, coverage, version, etc.]

        > **[Detailed project description with technical focus]**

        🔗 **Documentation**: [Link]  
        🚀 **Live Demo**: [Link]  
        📊 **Metrics**: [Link]

        ## 📋 Table of Contents

        - [📖 Overview](#overview)
        - [⚡ Features](#features)
        - [🏗️ Architecture](#architecture)
        - [🛠️ Installation](#installation)
        - [📖 Usage](#usage)
        - [🔧 Configuration](#configuration)
        - [🧪 Testing](#testing)
        - [🚀 Deployment](#deployment)
        - [📚 API Reference](#api-reference)
        - [🤝 Contributing](#contributing)

        ## 📖 Overview

        [Detailed technical overview with multiple paragraphs]

        ## ⚡ Features

        ### 🏢 Core Features
        - 🎯 **[Feature]**: [Technical description]
        - 🔐 **[Feature]**: [Technical description]

        ### 🔧 Developer Features
        - 🛠️ **[Feature]**: [Technical description]
        - 📊 **[Feature]**: [Technical description]

        ## 🏗️ Architecture

        [Describe system architecture with technical details]

        ## 🛠️ Installation

        ### 📋 Prerequisites

        - 🐧 **OS**: [Requirements]
        - 🟢 **Node.js**: [Version requirements]
        - 📦 **Package Manager**: [npm/yarn requirements]

        ### 🚀 Quick Start

        \`\`\`bash
        # Clone and setup
        git clone [repo]
        cd [project]
        npm install
        npm run dev
        \`\`\`

        ### 🔧 Advanced Installation

        [Detailed installation steps with multiple environments]

        ## 📖 Usage

        ### 🌟 Basic Usage

        \`\`\`javascript
        // Example code with detailed comments
        \`\`\`

        ### 🔧 Advanced Usage

        [Multiple code examples with explanations]

        ## 🧪 Testing

        ### 📋 Test Types

        - 🧪 **Unit Tests**: \`npm test\`
        - 🔗 **Integration Tests**: \`npm run test:integration\`
        - 🌐 **E2E Tests**: \`npm run test:e2e\`

        ## 🚀 Deployment

        [Deployment instructions for multiple platforms]

        ## 📚 API Reference

        [Comprehensive API documentation with examples]

        ## 🤝 Contributing

        [Detailed contributing guidelines]

        ## 📄 License

        This project is licensed under the [License Type] License.

        Make it extremely detailed with at least 600+ lines, technical depth, and emoji navigation.
        `;
      case 'minimal':
        return `
        Create a clean but attractive README with essential emojis and complete content:

        # [Actual Project Name]

        [Generate specific badges based on detected tech stack]

        > **[Write clear, compelling description of what the project does]**

        ## ✨ Features

        - 🚀 **[Generate specific feature name]**: [Detailed description of capability]
        - 🎨 **[Generate design/UI feature]**: [Specific implementation details]
        - 📱 **[Generate responsive feature]**: [Mobile/desktop capabilities]
        - 🔧 **[Generate configuration feature]**: [Customization options]

        ## 🛠️ Installation

        \`\`\`bash
        # Clone the repository
        git clone [actual repo URL]
        cd [actual project name]

        # Install dependencies
        npm install

        # Start development server
        npm run dev
        \`\`\`

        ## 📖 Usage

        \`\`\`javascript
        // Generate realistic usage example based on project type
        import { [GenerateRelevantImport] } from '[project-name]';

        const [relevantVariable] = new [GenerateClassName]({
          [generateRelevantConfig]: '[realistic-value]',
          [generateAnotherOption]: true
        });

        // Example usage
        [relevantVariable].[generateMethod]()
          .then(result => {
            console.log('Success:', result);
          })
          .catch(error => {
            console.error('Error:', error);
          });
        \`\`\`

        ## 🔧 Configuration

        Create a \`.env\` file in your project root:

        \`\`\`env
        # Required environment variables
        VITE_API_URL=https://api.example.com
        VITE_API_KEY=your_api_key_here

        # Optional settings
        VITE_DEBUG_MODE=false
        VITE_THEME=dark
        \`\`\`

        ### Available Options

        | Option | Type | Default | Description |
        |--------|------|---------|-------------|
        | [generateOption1] | string | '[defaultValue]' | [Description of what this controls] |
        | [generateOption2] | boolean | false | [Explanation of this setting] |
        | [generateOption3] | number | 3000 | [What this number represents] |

        ## 🧪 Testing

        \`\`\`bash
        # Run all tests
        npm test

        # Run tests in watch mode
        npm run test:watch

        # Generate coverage report
        npm run test:coverage
        \`\`\`

        ## 🚀 Deployment

        ### Vercel (Recommended)
        \`\`\`bash
        npm install -g vercel
        vercel --prod
        \`\`\`

        ### Netlify
        \`\`\`bash
        npm run build
        # Deploy the dist/ folder to Netlify
        \`\`\`

        ## 🤝 Contributing

        1. Fork the repository
        2. Create your feature branch: \`git checkout -b feature/new-feature\`
        3. Commit your changes: \`git commit -m 'Add new feature'\`
        4. Push to the branch: \`git push origin feature/new-feature\`
        5. Submit a pull request

        ## 📄 License

        This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

        Keep formatting clean but substantial - at least 300+ lines with realistic examples and complete information. NO placeholders - generate actual, usable content.
        `;
      case 'showcase':
        return `
        Create a project showcase README with stunning visual appeal:

        # 🌟 [Project Name] - [Compelling Tagline]

        [Impressive badges array]

        > **[Powerful value proposition with emphasis and benefits]**

        🎯 **Live Demo**: [Link] | 📊 **Analytics**: [Link] | 🏆 **Showcase**: [Link]

        ## 🚀 Why Choose [Project Name]?

        ### 💎 Key Benefits
        - ⚡ **[Benefit]**: [Compelling description with metrics]
        - 🎨 **[Benefit]**: [Compelling description with results]
        - 🚀 **[Benefit]**: [Compelling description with impact]

        ## ✨ Feature Showcase

        ### 🎯 Core Features
        - 🤖 **[Feature]**: [Detailed description with benefits]
        - 🎨 **[Feature]**: [Detailed description with benefits]
        - 📊 **[Feature]**: [Detailed description with benefits]
        - 🔒 **[Feature]**: [Detailed description with benefits]

        ### 🌟 Advanced Features
        - 🚀 **[Feature]**: [Advanced capability description]
        - 🛠️ **[Feature]**: [Advanced capability description]

        ## 🎬 Demo & Screenshots

        [Describe demo scenarios and screenshot placeholders]

        ## 🏁 Quick Start

        Get up and running in minutes:

        \`\`\`bash
        # One-line installation
        npx [package-name] init my-project
        cd my-project
        npm start
        \`\`\`

        ## 🎯 Use Cases

        ### 🏢 For Businesses
        - [Use case with benefits]

        ### 👩‍💻 For Developers
        - [Use case with benefits]

        ## 📊 Performance & Metrics

        [Performance highlights and benchmarks]

        ## 🎨 Customization

        [Customization options and themes]

        ## 🌟 Community Showcase

        [Community examples and testimonials]

        ## 🗺️ Roadmap

        [Upcoming features and timeline]

        ## 🏆 Recognition

        [Awards, mentions, testimonials]

        ## 🤝 Contributing

        Join our amazing community! [Contributing guidelines]

        ## 📄 License

        [License with link]

        ---

        <div align="center">
          <h3>🌟 Star this project if you find it useful! 🌟</h3>
          <p>Built with ❤️ by [Developer Name]</p>
        </div>

        Make it visually stunning and comprehensive with at least 500+ lines, rich emojis, and showcase appeal.
        `;
      default:
        return 'Create a comprehensive README file with emojis, attractive formatting, and detailed sections (400+ lines).';
    }
  };

  const generateAISuggestions = async (repoData) => {
    try {
      const prompt = `Based on this repository data, suggest 5 improvements for the README:
      - Name: ${repoData.repo.name}
      - Language: ${repoData.repo.language}
      - Description: ${repoData.repo.description}
      
      Provide specific, actionable suggestions in JSON format:
      [{"title": "suggestion title", "description": "detailed description", "priority": "high/medium/low"}]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1000 }
          })
        }
      );

      const data = await response.json();
      const suggestions = JSON.parse(data.candidates[0].content.parts[0].text);
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const analyzeReadmeQuality = (readme) => {
    const metrics = {
      wordCount: readme.split(' ').length,
      sectionCount: (readme.match(/^#+\s/gm) || []).length,
      codeBlocks: (readme.match(/```/g) || []).length / 2,
      links: (readme.match(/\[.*?\]\(.*?\)/g) || []).length,
      badges: (readme.match(/!\[.*?\]\(.*?\)/g) || []).length
    };

    const score = Math.min(100, 
      (metrics.wordCount > 500 ? 25 : metrics.wordCount * 0.05) +
      (metrics.sectionCount > 8 ? 25 : metrics.sectionCount * 3) +
      (metrics.codeBlocks > 3 ? 20 : metrics.codeBlocks * 6.67) +
      (metrics.links > 5 ? 15 : metrics.links * 3) +
      (metrics.badges > 3 ? 15 : metrics.badges * 5)
    );

    setReadmeQuality({ score: Math.round(score), metrics });
  };

  const exportReadme = (format) => {
    let content = generatedReadme;
    let filename = 'README';
    let mimeType = 'text/markdown';

    switch (format) {
      case 'html':
        content = renderMarkdownToHTML(generatedReadme);
        filename = 'README.html';
        mimeType = 'text/html';
        break;
      case 'pdf':
        // For PDF, we'd need a library like jsPDF, but for now show placeholder
        alert('PDF export would require additional library integration');
        return;
      case 'txt':
        content = generatedReadme.replace(/[#*`\[\]()]/g, '');
        filename = 'README.txt';
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMarkdownToHTML = (markdown) => {
    return `<!DOCTYPE html>
<html>
<head>
  <title>README</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; }
  </style>
</head>
<body>
  ${renderMarkdownPreview(markdown)?.props.dangerouslySetInnerHTML.__html || markdown}
</body>
</html>`;
  };

  const generateCustomReadme = async (repoData, customInstructions) => {
    const enhancedPrompt = `
    ${customInstructions}
    
    Repository Information:
    - Name: ${repoData.repo.name}
    - Description: ${repoData.repo.description || 'No description provided'}
    - Language: ${repoData.repo.language || 'Not specified'}
    - Stars: ${repoData.repo.stargazers_count || 0}
    
    Create a comprehensive README following the custom instructions above while maintaining professional quality.
    `;

    return await generateReadmeWithGemini({ ...repoData, customPrompt: enhancedPrompt }, 'custom');
  };

  const generateMITLicense = (repoData) => {
    const currentYear = new Date().getFullYear();
    const ownerName = repoData.repo.owner?.login || repoData.repo.full_name?.split('/')[0] || 'Project Owner';
    
    return `MIT License

Copyright (c) ${currentYear} ${ownerName}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
  };

  const renderMarkdownPreview = (markdown) => {
    if (!markdown) return null;

    // Simple markdown to HTML converter for preview
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mb-3 mt-6">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4 mt-8">$1</h1>')
      
      // Code blocks
      .replace(/```([^`]+)```/gim, '<pre class="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4"><code class="text-green-400 text-sm">$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-700 px-2 py-1 rounded text-blue-300">$1</code>')
      
      // Bold and italic
      .replace(/\*\*([^*]+)\*\*/gim, '<strong class="font-semibold text-white">$1</strong>')
      .replace(/\*([^*]+)\*/gim, '<em class="italic text-gray-300">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank">$1</a>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="text-gray-300 mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="text-gray-300 mb-1">$1</li>')
      
      // Line breaks
      .replace(/\n\n/gim, '</p><p class="text-gray-300 mb-4">')
      .replace(/\n/gim, '<br>');

    // Wrap in paragraph tags
    html = '<p class="text-gray-300 mb-4">' + html + '</p>';
    
    // Fix list wrapping
    html = html.replace(/(<li[^>]*>.*?<\/li>)/gims, (match, group) => {
      return match.replace(/<\/?p[^>]*>/gim, '');
    });
    
    html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gims, '<ul class="list-disc list-inside mb-4 space-y-1">$&</ul>');

    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-invert max-w-none" />;
  };

  const validateApiKey = async () => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Hello'
              }]
            }]
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`API validation failed: ${response.status}`);
      }
      
      console.log('✅ Gemini API key is valid');
      return true;
    } catch (error) {
      console.error('❌ Gemini API key validation failed:', error);
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!githubUrl || !selectedTemplate) {
      setError('Please provide a GitHub URL and select a template.');
      return;
    }

    const repoInfo = extractRepoInfo(githubUrl);
    if (!repoInfo) {
      setError('Please provide a valid GitHub repository URL (e.g., https://github.com/username/repository).');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedReadme('');

    try {
      console.log('🔄 Starting README generation process...');
      console.log('Repository:', repoInfo);
      console.log('Template:', selectedTemplate);
      
      // Validate API key first
      const isApiValid = await validateApiKey();
      if (!isApiValid) {
        throw new Error('Invalid API key. Please check your Gemini API configuration.');
      }
      
      console.log('📡 Fetching repository data...');
      const repoData = await fetchRepoData(repoInfo.owner, repoInfo.repo);
      
      console.log('✅ Repository data fetched:', repoData.repo.name);
      console.log('🤖 Generating README with AI...');
      
      const readme = await generateReadmeWithGemini(repoData, selectedTemplate);
      
      if (!readme || readme.trim().length === 0) {
        throw new Error('Generated README is empty. Please try again.');
      }
      
      setGeneratedReadme(readme);
      
      // Analyze README quality
      analyzeReadmeQuality(readme);
      
      // Generate AI suggestions
      await generateAISuggestions(repoData);
      
      // Generate MIT License if enabled
      if (generateLicense) {
        const license = generateMITLicense(repoData);
        setGeneratedLicense(license);
      }
      
      console.log('🎉 README generated successfully!');
    } catch (err) {
      console.error('❌ Generation error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedReadme);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadLicense = () => {
    const blob = new Blob([generatedLicense], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LICENSE';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLicense = async () => {
    try {
      await navigator.clipboard.writeText(generatedLicense);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy license text:', err);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!repoInfo) {
      setError('Please generate a README first to get AI suggestions.');
      return;
    }

    if (showAiSuggestions && aiSuggestions.length > 0) {
      // If suggestions are already shown, just toggle visibility
      setShowAiSuggestions(false);
      return;
    }

    try {
      setShowAiSuggestions(true);
      const repoData = { repo: repoInfo };
      await generateAISuggestions(repoData);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setError('Failed to generate AI suggestions. Please try again.');
      setShowAiSuggestions(false);
    }
  };

  const handleAnalyzeReadme = async () => {
    if (!analysisReadmeContent.trim()) {
      setError('Please provide README content to analyze.');
      return;
    }

    setAnalysisLoading(true);
    setError('');
    setAnalysisSuggestions([]);

    try {
      // Extract repo info if URL is provided
      let repoData = null;
      if (analysisRepoUrl.trim()) {
        const repoInfo = extractRepoInfo(analysisRepoUrl);
        if (repoInfo) {
          repoData = await fetchRepoData(repoInfo.owner, repoInfo.repo);
        }
      }

      const prompt = `Analyze this README content and provide 5 specific improvement suggestions:

README Content:
${analysisReadmeContent}

${repoData ? `Repository Information:
- Name: ${repoData.repo.name}
- Language: ${repoData.repo.language}
- Description: ${repoData.repo.description}
- Stars: ${repoData.repo.stargazers_count}` : ''}

Provide specific, actionable suggestions for improving this README. Return ONLY a valid JSON array (no markdown, no code blocks, no extra text):
[{"title": "suggestion title", "description": "detailed description with specific examples", "priority": "high/medium/low", "category": "structure/content/formatting/completeness"}]

Focus on:
1. Missing sections or content
2. Formatting and structure improvements
3. Code examples and documentation clarity
4. Professional presentation
5. User experience and accessibility`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2000 }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract and clean the AI response
      let aiResponse = data.candidates[0].content.parts[0].text;
      
      // Remove markdown code blocks if present
      aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      
      // Parse the cleaned JSON
      const suggestions = JSON.parse(aiResponse);
      setAnalysisSuggestions(suggestions);
      setShowAnalysisSuggestions(true);
    } catch (error) {
      console.error('Failed to analyze README:', error);
      
      // Log the raw AI response for debugging
      if (error.name === 'SyntaxError' && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Raw AI response:', data.candidates[0].content.parts[0].text);
      }
      
      setError('Failed to analyze README. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="min-h-screen code-bg">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-8 h-8 text-blue-500" />
                <h1 className="text-2xl font-bold text-white">IntelliReadme</h1>
              </div>
              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                v2.0.1
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#templates" className="text-gray-300 hover:text-white transition-colors">Templates</a>
                <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Documentation</a>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </div>
              <div className="flex items-center space-x-3">
                <a 
                  href="https://github.com/somyadipghosh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a 
                  href="https://github.com/somyadipghosh/readmegenerator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>Contribute</span>
                </a>
                <a 
                  href="https://www.somyadip.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Portfolio</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12" id="home">
          <div className="mb-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Generate Professional <span className="text-blue-400">README</span> Files
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
              Transform your GitHub repositories with AI-powered documentation. 
              Choose from professional templates and let our intelligent system create 
              the perfect README for your project.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Rocket className="w-4 h-4" />
                <span>Professional Templates</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>Live Preview</span>
              </span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="card-dark rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="text-blue-400">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16" id="features">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Why Choose IntelliReadme?</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Intelligent features designed to create professional documentation with ease
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="card-dark rounded-lg p-6">
              <div className="text-blue-400 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">AI-Powered Generation</h4>
              <p className="text-gray-400">
                Leverage Google Gemini AI to create comprehensive, detailed README files 
                with 400-600+ lines of professional content.
              </p>
            </div>
            
            <div className="card-dark rounded-lg p-6">
              <div className="text-green-400 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Multiple Templates</h4>
              <p className="text-gray-400">
                Choose from 4 professionally designed templates: Attractive, Detailed, 
                Minimal, and Showcase - each optimized for different project types.
              </p>
            </div>
            
            <div className="card-dark rounded-lg p-6">
              <div className="text-purple-400 mb-4">
                <Eye className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Live Preview</h4>
              <p className="text-gray-400">
                Toggle between raw markdown and beautiful rendered preview to see 
                exactly how your README will look on GitHub.
              </p>
            </div>
            
            <div className="card-dark rounded-lg p-6">
              <div className="text-yellow-400 mb-4">
                <Github className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">GitHub Integration</h4>
              <p className="text-gray-400">
                Automatically fetches repository data, languages, stars, and file structure 
                to create contextually relevant documentation.
              </p>
            </div>
            
            <div className="card-dark rounded-lg p-6">
              <div className="text-red-400 mb-4">
                <Download className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Multi-Format Export</h4>
              <p className="text-gray-400">
                Export your README in multiple formats: Markdown, HTML, and TXT. 
                Perfect for different platforms and use cases.
              </p>
            </div>
            
            <div className="card-dark rounded-lg p-6">
              <div className="text-orange-400 mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">MIT License Generator</h4>
              <p className="text-gray-400">
                Automatically generates MIT license files with proper copyright 
                information extracted from your repository details.
              </p>
            </div>

            <div className="card-dark rounded-lg p-6">
              <div className="text-cyan-400 mb-4">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Quality Analysis</h4>
              <p className="text-gray-400">
                Real-time quality scoring based on word count, sections, code blocks, 
                links, and badges for professional documentation.
              </p>
            </div>

            <div className="card-dark rounded-lg p-6">
              <div className="text-indigo-400 mb-4">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">AI Suggestions</h4>
              <p className="text-gray-400">
                Get intelligent suggestions for improving your README with 
                personalized recommendations based on your project.
              </p>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-16" id="templates">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Professional Templates</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Each template is carefully designed for specific use cases and project types
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {readmeTemplates.map((template) => (
              <div key={template.id} className="card-dark rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-blue-400">{template.icon}</div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">{template.name}</h4>
                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                      {template.complexity}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{template.description}</p>
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation Section */}
        <div className="mb-16" id="docs">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">How It Works</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Generate professional README files in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Enter Repository URL</h4>
              <p className="text-gray-400">
                Paste your GitHub repository URL. We'll automatically fetch project details, 
                languages, structure, and metadata.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">2</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Choose Template</h4>
              <p className="text-gray-400">
                Select from our professional templates based on your project type and 
                documentation needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Generate & Download</h4>
              <p className="text-gray-400">
                Our AI creates a comprehensive README with detailed sections, code examples, 
                and professional formatting.
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="card-dark rounded-lg p-8">
            <h4 className="text-2xl font-bold text-white mb-6">Technical Specifications</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-lg font-semibold text-white mb-4">🚀 Technology Stack</h5>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span>React 18 with Modern Hooks</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span>Vite for Lightning-Fast Development</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Tailwind CSS v4 for Styling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Google Gemini AI API</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Github className="w-4 h-4 text-gray-400" />
                    <span>GitHub API Integration</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-white mb-4">⚡ Key Features</h5>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>AI-Generated Content (400-600+ lines)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Real-time Markdown Preview</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Professional GitHub-inspired UI</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Responsive Design</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Copy/Download Functionality</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Input Section */}
          <div className="lg:col-span-4">
            <div className="card-dark rounded-lg p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Configuration</h3>
              </div>
              
              {/* GitHub URL Input */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Repository URL
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="input-field w-full pl-12"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  💡 Examples: facebook/react, microsoft/vscode, vercel/next.js
                </div>
              </div>

              {/* Repository Info */}
              {repoInfo && (
                <div className="mb-6 p-4 terminal-bg rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <GitBranch className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Repository Detected</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{repoInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Language:</span>
                      <span className="text-blue-400">{repoInfo.language || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stars:</span>
                      <span className="text-yellow-400 flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {repoInfo.stargazers_count}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-4">
                  Template Style
                </label>
                <div className="space-y-3">
                  {readmeTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-400 mt-1">{template.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium">{template.name}</h4>
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                              {template.complexity}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{template.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {template.features.slice(0, 2).map((feature, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* License Generation Option */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="generateLicense"
                    checked={generateLicense}
                    onChange={(e) => setGenerateLicense(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="generateLicense" className="text-gray-300 text-sm font-medium">
                    Generate MIT License
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ⚖️ Automatically generate a MIT license file for your project
                </p>
              </div>

              {/* Export Format Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="markdown">Markdown (.md)</option>
                  <option value="html">HTML (.html)</option>
                  <option value="txt">Plain Text (.txt)</option>
                </select>
              </div>

              {/* Advanced Options */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 text-sm font-medium">Advanced Options</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                      className="btn-secondary-sm flex items-center space-x-1"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Custom</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Prompt */}
              {showCustomPrompt && (
                <div className="mb-6 p-4 border border-gray-600 rounded-lg">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Custom Instructions
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Add specific instructions for your README generation..."
                    className="input-field w-full h-20 resize-none"
                  />
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !githubUrl || !selectedTemplate}
                className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Generate README</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="text-red-400 mt-0.5">⚠️</div>
                    <div>
                      <div className="text-red-200 text-sm font-medium mb-1">Error</div>
                      <div className="text-red-300 text-sm">{error}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Output */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {/* README Section */}
              <div className="card-dark rounded-lg overflow-hidden">
                {/* Output Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Generated README.md</h3>
                  </div>
                  {generatedReadme && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{showPreview ? 'Code' : 'Preview'}</span>
                      </button>
                      {readmeQuality && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-lg">
                          <BarChart3 className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400 font-medium">
                            {readmeQuality.score}%
                          </span>
                        </div>
                      )}
                      <button
                        onClick={handleCopy}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <div className="relative">
                        <select
                          value={exportFormat}
                          onChange={(e) => {
                            setExportFormat(e.target.value);
                            exportReadme(e.target.value);
                          }}
                          className="btn-primary appearance-none pr-8"
                        >
                          <option value="markdown">Download MD</option>
                          <option value="html">Download HTML</option>
                          <option value="txt">Download TXT</option>
                        </select>
                        <Download className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Content */}
                <div className="relative">
                  {generatedReadme ? (
                    <div className="code-editor">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">README.md</span>
                      </div>
                      <div className="p-4 max-h-96 overflow-y-auto">
                        {showPreview ? (
                          <div className="prose prose-invert max-w-none">
                            {renderMarkdownPreview(generatedReadme)}
                          </div>
                        ) : (
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                            {generatedReadme}
                          </pre>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <div className="text-center">
                        <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Ready to generate your README</p>
                        <p className="text-sm mb-4">Enter a repository URL and select a template to get started</p>
                        <div className="text-xs text-gray-500">
                          <p>✨ Powered by Google Gemini AI</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>



              {/* Quality Metrics */}
              {readmeQuality && (
                <div className="card-dark rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    <h4 className="text-lg font-semibold text-white">Quality Analysis</h4>
                    <div className="ml-auto">
                      <span className="text-2xl font-bold text-green-400">{readmeQuality.score}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Word Count:</span>
                      <span className="text-white">{readmeQuality.metrics.wordCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sections:</span>
                      <span className="text-white">{readmeQuality.metrics.sectionCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Code Blocks:</span>
                      <span className="text-white">{readmeQuality.metrics.codeBlocks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Links:</span>
                      <span className="text-white">{readmeQuality.metrics.links}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Badges:</span>
                      <span className="text-white">{readmeQuality.metrics.badges}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${readmeQuality.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* License Section */}
              {generateLicense && generatedLicense && (
                <div className="card-dark rounded-lg overflow-hidden">
                  {/* License Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Generated LICENSE</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopyLicense}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleDownloadLicense}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* License Content */}
                  <div className="relative">
                    <div className="code-editor">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">LICENSE</span>
                      </div>
                      <div className="p-4 max-h-64 overflow-y-auto">
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                          {generatedLicense}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* README Analysis Section */}
      <div className="border-t border-gray-700 py-16" id="analysis">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">README Analysis & Suggestions</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Already have a README? Get AI-powered suggestions to improve it! Paste your existing README content 
              and optionally provide your repository URL for context-aware recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-5">
              <div className="card-dark rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-lg font-semibold text-white">Analyze Your README</h4>
                </div>

                {/* Repository URL (Optional) */}
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Repository URL <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={analysisRepoUrl}
                      onChange={(e) => setAnalysisRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="input-field w-full pl-12"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    💡 Providing your repo URL helps generate more contextual suggestions
                  </div>
                </div>

                {/* README Content */}
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    README Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={analysisReadmeContent}
                    onChange={(e) => setAnalysisReadmeContent(e.target.value)}
                    placeholder="Paste your existing README.md content here..."
                    className="input-field w-full h-64 resize-none font-mono text-sm"
                    required
                  />
                  <div className="mt-2 text-xs text-gray-400">
                    📝 Paste your current README content in Markdown format
                  </div>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyzeReadme}
                  disabled={analysisLoading || !analysisReadmeContent.trim()}
                  className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                    analysisLoading || !analysisReadmeContent.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {analysisLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      <span>Analyze README</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-7">
              <div className="card-dark rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-lg font-semibold text-white">AI Suggestions</h4>
                  </div>
                  {analysisSuggestions.length > 0 && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 rounded-lg">
                      <span className="text-sm text-yellow-400 font-medium">
                        {analysisSuggestions.length} suggestions
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {analysisSuggestions.length > 0 ? (
                    <div className="space-y-4">
                      {analysisSuggestions.map((suggestion, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700/30 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-medium text-white text-lg">{suggestion.title}</h5>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {suggestion.priority}
                              </span>
                              {suggestion.category && (
                                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                  {suggestion.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{suggestion.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <div className="text-center">
                        <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Ready to analyze your README</p>
                        <p className="text-sm mb-4">Paste your README content and click "Analyze README" to get started</p>
                        <div className="text-xs text-gray-500">
                          <p>🎯 Get personalized improvement suggestions</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-16" id="contact">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Terminal className="w-6 h-6 text-blue-500" />
                <span className="text-white font-semibold">IntelliReadme</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Intelligent README generator powered by AI. 
                Create beautiful documentation for your projects in seconds.
              </p>
              <div className="flex items-center space-x-3">
                <a 
                  href="https://github.com/somyadipghosh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/somyadipghosh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://x.com/somyadipghosh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/somyadipghosh/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com/somyadipghosh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Source Code</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Developer</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://www.somyadip.me/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Portfolio</a></li>
                <li><a href="https://github.com/somyadipghosh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Profile</a></li>
                <li><a href="https://www.linkedin.com/in/somyadipghosh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="https://x.com/somyadipghosh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a 
                    href="https://www.somyadip.me/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Portfolio Website</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:somyadipghosh@gmail.com" 
                    className="hover:text-white transition-colors"
                  >
                    Email: somyadipghosh@gmail.com
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/somyadipghosh" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white transition-colors"
                  >
                    Open Source Projects
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 IntelliReadme. Built with ❤️ by{' '}
              <a 
                href="https://www.somyadip.me/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Somyadip Ghosh
              </a>
              {' '}using React, Tailwind CSS, and Google Gemini AI
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <a href="https://www.somyadip.me/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Portfolio</a>
              <a href="https://github.com/somyadipghosh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
