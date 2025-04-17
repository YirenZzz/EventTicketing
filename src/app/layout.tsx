//已改

// // app/layout.tsx
// import './globals.css'; // 你可以放置Tailwind或其他css
// import { Inter } from 'next/font/google';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'My Event Platform',
//   description: 'Minimal Next.js + Prisma Setup',
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" className={inter.className}>
//       <body>{children}</body>
//     </html>
//   );
// }









import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "../components/Providers";  // 注意路径根据你的项目结构而定

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ticket.Events",
  description: "Event Ticketing and Check-in System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {/* 包裹 SessionProvider 供全局使用 */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


