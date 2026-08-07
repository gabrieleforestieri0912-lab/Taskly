import { Inter } from "next/font/google";
import "./globals.css";
import ThemeSync from "../components/ThemeSync";
import GoogleAuthProvider from "../components/GoogleAuthProvider";
import { LanguageProvider } from "../lib/LanguageContext";
import KeyboardShortcuts from "../components/KeyboardShortcuts";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "../lib/site";
import { FAQ_ITEMS } from "../lib/faq";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Il tuo workspace di produttività`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "task manager",
    "gestione task",
    "produttività",
    "app di pianificazione",
    "workspace intelligente",
    "note",
    "obiettivi",
    "calendario",
    "AI assistant",
    "taskly",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Il tuo workspace di produttività`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Il tuo workspace di produttività`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  sameAs: [
    "https://github.com/gabrieleforestieri0912-lab/Taskly",
    "https://twitter.com",
    "https://linkedin.com",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "it-IT",
  description: SITE_DESCRIPTION,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
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
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
