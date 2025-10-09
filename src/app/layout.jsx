import { Outfit } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "BVT Training Admin Dashboard",
  description: "Admin dashboard for BVT Training Website",
  icons: {
    icon: "/BVT_logo.png",
    shortcut: "/BVT_logo.png",
    apple: "/BVT_logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force light theme only
              (function() {
                localStorage.setItem('theme', 'light');
                document.documentElement.classList.remove('dark');
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.className} bg-gray-50`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
