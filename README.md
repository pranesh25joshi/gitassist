# 🚀 GitAssist - AI-Powered GitHub Profile Analyzer

GitAssist is an intelligent AI-powered chat assistant that provides comprehensive analysis of GitHub profiles. Ask questions about any GitHub user's repositories, coding activity, contributions, followers, organizations, and much more using natural language.

🌐 **Live Demo**: [gitassist.pranesh.xyz](https://gitassist.pranesh.xyz)

Built with modern technologies:
- **Next.js 15.3.0** with Turbopack for blazing-fast development
- **Google Gemini 2.5 Flash** for intelligent intent detection and response generation
- **GitHub API Integration** for real-time data fetching
- **React & TypeScript** with shadcn/ui components
- **Zustand** for state management
- **Tailwind CSS** for beautiful styling
- **ReactMarkdown** for rich message formatting

---

## ✨ Features

### 🎯 Comprehensive GitHub Analysis
- **Profile Information**: Bio, location, company, follower count, and more
- **Repository Analysis**: Recent repos, top-starred projects, language distribution
- **Activity Tracking**: Recent commits, contribution patterns, coding streaks
- **Social Network**: Followers, following, organizational memberships
- **Code Portfolio**: Gists, pull requests, repository statistics
- **Profile README**: Automatic detection and display

### 🤖 AI-Powered Intelligence
- **Intent Detection**: Automatically understands what you're asking for
- **Natural Language**: Ask questions in plain English
- **Smart Responses**: Context-aware answers with proper formatting
- **Fallback Handling**: Graceful degradation when APIs are unavailable

### 💫 User Experience
- **Real-time Chat Interface**: Smooth, responsive chat experience
- **Loading Indicators**: Visual feedback during data processing
- **Error Handling**: Robust error management with helpful messages
- **Auto-scroll**: Automatically scrolls to latest messages
- **Suggestion Prompts**: Pre-built questions to get started quickly

---

## 🎯 What You Can Ask

GitAssist can answer questions like:

- "What projects has this user worked on?"
- "Show me their coding activity and contribution patterns"
- "What programming languages do they use most?"
- "Who follows this developer and who do they follow?"
- "Show me their best and most starred repositories"
- "What organizations are they part of?"
- "Any recent contributions or commits?"
- "Show me their gists and code snippets"
- "What's their overall repository statistics?"

---

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/pranesh25joshi/gitassist.git
   cd gitassist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your API keys:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

---

## 🏗️ Architecture

GitAssist uses a modular architecture with separate API endpoints:

### API Routes
- **`/api/detect-intents`** - AI-powered intent detection using Gemini
- **`/api/generate-response`** - GitHub data fetching and response generation

### Components
- **`ChatBox`** - Main chat interface with message handling
- **`UsernameInput`** - GitHub username input and validation
- **UI Components** - shadcn/ui components for consistent design

### Data Flow
1. User enters a question about a GitHub user
2. Intent detection API analyzes the question using Gemini AI
3. Relevant GitHub APIs are called based on detected intents
4. Response generation API creates a comprehensive answer
5. Result is displayed in the chat interface with proper formatting

## 🧩 Project Structure

```bash
gitassist/
├── app/
│   ├── api/
│   │   ├── detect-intents/
│   │   │   └── route.js           # AI intent detection endpoint
│   │   └── generate-response/
│   │       └── route.js           # GitHub data fetching & response generation
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/
│   ├── ChatBox.js                 # Main chat interface
│   ├── UsernameInput.js           # GitHub username input
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── store.js                   # Zustand state management
│   ├── utils.ts                   # Utility functions
│   ├── gemini.js                  # Gemini AI configuration
│   └── github.js                  # GitHub API utilities
└── public/
    └── gitassist-logo.png         # App logo and assets
```

---

## 🔧 Technical Details

### Supported Intents
GitAssist can detect and respond to these types of queries:

- **`user_bio`** - Profile information and basic stats
- **`recent_repos`** - Latest repositories and projects
- **`recent_commits`** - Recent commit activity
- **`open_pull_requests`** - Active pull requests
- **`repo_languages`** - Programming language distribution
- **`starred_repos`** - Starred/bookmarked repositories
- **`followers`** - Follower information
- **`following`** - Users being followed
- **`gists`** - Public code snippets
- **`organizations`** - Organizational memberships
- **`contribution_activity`** - Contribution patterns and streaks
- **`top_repositories`** - Most popular repositories by stars
- **`repository_stats`** - Aggregate statistics
- **`profile_readme`** - Profile README content

### Error Handling
- Graceful fallbacks when AI services are unavailable
- Rate limit handling for GitHub API
- Comprehensive error messages for better user experience
- Fallback responses when specific data isn't available

---

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. **Push to GitHub** (if not already done)
2. **Connect to Vercel** - Import your repository
3. **Environment Variables** - Add your API keys in Vercel dashboard
4. **Deploy** - Automatic deployment with every push

### Environment Variables Required:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for new components
- Follow the existing code style
- Add proper error handling
- Test with different GitHub usernames
- Update documentation when needed

---

## 📊 Performance Features

- **Optimized Data Fetching**: Only fetches required GitHub API endpoints
- **Intelligent Caching**: Reduces redundant API calls
- **Rate Limit Handling**: Graceful handling of GitHub API limits
- **Fallback Responses**: Works even when AI services are down
- **Minimal Bundle Size**: Tree-shaken dependencies and optimized builds

---

## 🔒 Privacy & Security

- **No Data Storage**: User queries and GitHub data are not stored
- **API Key Security**: Environment variables for sensitive credentials
- **Rate Limiting**: Respects GitHub API rate limits
- **Error Sanitization**: Safe error messages without exposing internals

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "@ai-sdk/google": "^0.0.54",
  "@google/generative-ai": "^0.21.0",
  "@radix-ui/react-icons": "^1.3.2",
  "axios": "^1.7.9",
  "lucide-react": "^0.468.0",
  "next": "15.3.0",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "react-markdown": "^9.0.1",
  "zustand": "^5.0.2"
}
```

### UI Components
- **shadcn/ui** - Modern, accessible React components
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI primitives

### AI & APIs
- **Google Gemini 2.5 Flash** - Advanced language model for intent detection
- **GitHub REST API** - Real-time GitHub data fetching
- **Axios** - HTTP client for API requests

---

## 🌟 Roadmap

### Upcoming Features
- [ ] **Repository Deep Dive** - Detailed analysis of specific repositories
- [ ] **Contribution Graphs** - Visual representation of contribution patterns
- [ ] **Comparison Mode** - Compare multiple GitHub users
- [ ] **Export Reports** - Download analysis as PDF/JSON
- [ ] **Advanced Filters** - Filter by date ranges, languages, etc.
- [ ] **GitHub Enterprise** - Support for GitHub Enterprise instances

### Performance Improvements
- [ ] **Request Caching** - Cache GitHub API responses
- [ ] **Streaming Responses** - Real-time response streaming
- [ ] **Batch Processing** - Optimize multiple API calls
- [ ] **Progressive Enhancement** - Improved loading states

---

## � License

MIT License © 2025 [Pranesh Joshi](https://github.com/pranesh25joshi)

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **GitHub API** - For providing comprehensive developer data
- **Google Gemini** - For powerful AI capabilities
- **Vercel** - For seamless deployment and hosting
- **shadcn/ui** - For beautiful, accessible UI components
- **The Open Source Community** - For inspiration and contributions

---

## 📧 Contact

**Pranesh Joshi**
- GitHub: [@pranesh25joshi](https://github.com/pranesh25joshi)
- Website: [pranesh.xyz](https://pranesh.xyz)
- Project: [gitassist.pranesh.xyz](https://gitassist.pranesh.xyz)

---

**⭐ If you find GitAssist helpful, please give it a star on GitHub!**