import UsernameInput from '@/components/UsernameInput';
import ChatBox from '@/components/ChatBox';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { ModeToggle } from '@/components/ui/mode-toggle'; // You'll need to create this

export default function HomePage() {
  return (
    <div className="container h-full max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center space-x-2">
          <GitHubLogoIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">GitAssist</h1>
        </div>
        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com/yourusername/gitassist" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View on GitHub
          </a>
          <ModeToggle />
        </div>
      </header>

      <main className="space-y-6">
        <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="w-full lg:w-1/4">
            <UsernameInput />
          </div>
          <div className="w-full lg:w-3/4">
            <ChatBox />
          </div>
        </div>
      </main>
      
      <footer className="pt-8 text-center text-xs text-muted-foreground">
        <p>
          Made by{" "}
          <a
        href="https://github.com/pranesh25joshi"
        className="underline hover:text-foreground transition-colors"
        target="_blank"
        rel="noopener noreferrer"
          >
        Young master Pranesh Joshi
          </a>{" "}
          © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}