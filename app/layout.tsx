import Link from "next/link";
import "./globals.css";

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



      </body>
    </html>
  );
}
