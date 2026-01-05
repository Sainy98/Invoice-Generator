import Link from "next/link";
import "./globals.css";
import { ToastProvider } from './components/ToastProvider';  // app/components/

export const metadata = {
  title: "Invoice Generator",
  description: "Simple invoice generator for small businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Wrap ENTIRE app */}
        <ToastProvider>
          <header className="layout-header">
            <div className="header-inner">
              <h1 className="logo">Invoice Generator</h1>
              <nav className="layout-nav">
                <Link href="/">Home</Link>
                <Link href="/settings">Settings</Link>
              </nav>
            </div>
          </header>

          <main className="layout-main">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
