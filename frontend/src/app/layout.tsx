import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineVerse AI | Intelligent Recommendations",
  description: "Find your next favorite movie using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              CineVerse <span className="text-red-500">AI</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <button className="text-gray-400 hover:text-white font-medium text-sm transition-colors">Profile</button>
            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Login</button>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
