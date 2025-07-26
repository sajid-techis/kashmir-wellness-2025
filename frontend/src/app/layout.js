// src/app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { NextThemeProvider } from './theme-provider';
import Header from '../components/layout/Header';
import SecondaryNav from '../components/layout/SecondaryNav';
import { ToastContainer } from 'react-toastify'; // <--- IMPORTANT: Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // <--- IMPORTANT: Import Toastify CSS
import ThemeToggleButton from "../components/common/ThemeToggleButton";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Kashmir Wellness',
  description: 'Your one-stop solution for health and wellness in Kashmir.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemeProvider>
          <Providers>
            <Header />
            <SecondaryNav />
            {children}
            <ThemeToggleButton />
            {/* <--- IMPORTANT: Add ToastContainer here, ideally just before the closing body tag */}
            <ToastContainer
              position="bottom-right" // You can change position (top-right, top-center, etc.)
              autoClose={3000}       // Auto close after 3 seconds
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Providers>
        </NextThemeProvider>
      </body>
    </html>
  );
}