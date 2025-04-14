# 🧠 GitAssist ChatBox

GitAssist is an interactive AI-powered chat assistant designed to answer questions about a GitHub user's activity — including their repositories, commits, pull requests, and more.

Built using:
- React & Next.js (Client Components)
- AI SDK (`@ai-sdk/react`)
- Zustand for state management
- Radix UI & Lucide for icons
- Tailwind CSS for styling
- `react-markdown` for rich message formatting

---

## 🚀 Features

- 🔍 Ask GitHub-related questions using natural language
- 💬 Real-time AI chat interface
- 🤖 Messages styled with proper markdown support
- 🧪 Error handling and loading indicators
- 🔄 Auto-scrolls to the latest message
- 🎯 Works with any valid GitHub username

---

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gitassist-chatbox.git
   cd gitassist-chatbox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install `react-markdown`**
   ```bash
   npm install react-markdown
   ```

4. **Run your dev server**
   ```bash
   npm run dev
   ```

---

## 🧩 Folder Structure

```bash
/components
  └── ChatBox.tsx        # Main chat interface
  └── ui/                # UI components like Button, Input, Card, etc.

/lib
  └── store.ts           # Zustand store for global state

/public
  └── gitassist-logo.png # Avatar for GitAssist bot
```

---

## ✨ Screenshots

> Add a screenshot of your chat UI in this section (e.g. `public/demo-chat.png`)

---

## 📦 Dependencies

- `@ai-sdk/react`
- `zustand`
- `react-markdown`
- `@radix-ui/react-icons`
- `lucide-react`
- `tailwindcss`
- `clsx` *(if used)*

---

## 📄 License

MIT License © 2025 [Pranesh Joshi]