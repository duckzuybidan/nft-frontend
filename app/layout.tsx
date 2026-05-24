import Header from "@/components/header";
import { MainProvider } from "@/lib/main-provider";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="min-h-screen min-w-screen">
        <MainProvider>
          <Header />
          {children}
        </MainProvider>
      </body>
    </html>
  );
}
