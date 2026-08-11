import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hive Academy',
  description: 'Training & Habit Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="dark">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
