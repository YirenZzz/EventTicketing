// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '../components/Providers';
import SocketInit from '@/components/SocketInit'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ticket.Events',
  description: 'Event Ticketing and Check-in System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          <SocketInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}