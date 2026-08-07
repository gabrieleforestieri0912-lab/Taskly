import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";
import ThemeSync from "../components/ThemeSync";
import GoogleAuthProvider from "../components/GoogleAuthProvider";
import { LanguageProvider } from "../lib/LanguageContext";
import KeyboardShortcuts from "../components/KeyboardShortcuts";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Taskly - Your Personal Productivity Hub",
  description: "Manage your goals, tasks, and ideas with AI-powered assistance",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">
        <GoogleAuthProvider>
          <LanguageProvider>
            <script
              dangerouslySetInnerHTML={{
                __html: `
              (function(){
                try{
                  // Dark by default: apply .dark unless the user explicitly
                  // chose light. Runs before hydration to avoid a flash.
                  var theme = localStorage.getItem('theme');
                  if (theme !== 'light') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }catch(e){ document.documentElement.classList.add('dark'); }
              })();
            `,
              }}
            />
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
            <ThemeSync />
            {children}
          </LanguageProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
