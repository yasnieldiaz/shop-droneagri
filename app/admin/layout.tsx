import { Inter } from 'next/font/google';
import '../globals.css';
import AdminLayoutClient from './AdminLayoutClient';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Admin | DroneAgri.pl',
  description: 'Panel de administración de DroneAgri.pl',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  );
}
