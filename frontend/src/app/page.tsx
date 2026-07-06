import { ChatBox } from "@/components/ChatBox";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-[#0a0a0f] to-[#0a0a0f]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 h-full">
        <ChatBox />
      </div>
    </main>
  );
}
