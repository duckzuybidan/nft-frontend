import Header from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { MainProvider } from "@/lib/main-provider";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "NFT Market — Buy Content & Copies",
  description:
    "Premium marketplace for original content (ERC-721) and licensed copies (ERC-1155).",
};

const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('nft-theme') || 'system';
    var dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.add(dark ? 'dark' : 'light');
    root.style.colorScheme = dark ? 'dark' : 'light';
    var loc = localStorage.getItem('nft-locale');
    if (loc === 'vn' || loc === 'en') root.lang = loc === 'vn' ? 'vi' : 'en';
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen min-w-screen flex-col overflow-x-hidden font-sans antialiased">
        <MainProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </MainProvider>
      </body>
    </html>
  );
}
