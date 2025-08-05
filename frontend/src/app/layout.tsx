import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cinemate - AI-Powered Movie Recommendations',
  description: 'Discover your next favorite movie with AI-powered recommendations. Rate movies and get personalized suggestions based on your taste.',
  keywords: ['movies', 'recommendations', 'AI', 'machine learning', 'entertainment'],
  authors: [{ name: 'Cinemate Team' }],
  openGraph: {
    title: 'Cinemate - AI-Powered Movie Recommendations',
    description: 'Discover your next favorite movie with AI-powered recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cinemate - AI-Powered Movie Recommendations',
    description: 'Discover your next favorite movie with AI-powered recommendations.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
