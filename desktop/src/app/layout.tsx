
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import GoogleAuthProvider from "../components/GoogleAuthProvider";
import { LanguageProvider } from "../lib/LanguageContext";
import Analytics from "../lib/analytics";
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import DesktopMiniChatHost from "../components/DesktopMiniChatHost";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Taskly - Your Personal Productivity Hub",
  description: "Manage your goals, tasks, and ideas with AI-powered assistance",
  icons: {
    icon: "/taskly.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="it"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-inter)' }}>
        <GoogleAuthProvider>
          <LanguageProvider>
            {/* Initialize analytics: track pageview and hook global errors */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
              (function(){
                try{
                  window.addEventListener('error', function(e){
                    try{ fetch('/api/analytics/events', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({events:[{name:'error',payload:{message:e.message,stack:e.error?e.error.stack:null},url:location.pathname,ts:Date.now()}]})})}catch(e){}
                  });
                  try{ fetch('/api/analytics/events', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({events:[{name:'pageview',payload:{},url:location.pathname,ts:Date.now()}]})})}catch(e){}
                }catch(e){}
              })();
            `,
              }}
            />
            <KeyboardShortcuts />
            <Suspense fallback={null}>
              <DesktopMiniChatHost />
            </Suspense>
            {children}
          </LanguageProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}

