import { Oswald, Poiret_One } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider';
import { Toaster } from 'react-hot-toast';


const oswald = Oswald({ 
  subsets: ['latin'],
  variable: '--font-oswald',
  weight: ['400', '700'],
  display: 'swap',
});


const poiretOne = Poiret_One({
  subsets: ['latin'],
  variable: '--font-poiret-one',
  weight: '400',
  display: 'swap',
});

export const metadata = {
  title: 'Arc Liem',
  description: 'Platform Pencarian Artikel Ilmiah Open Access',
};

export default function RootLayout({ children }) {
  return (
    
    <html lang="en" className={`${oswald.variable} ${poiretOne.variable} dark`}>
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <AuthProvider>
          <Toaster 
            position="top-center" 
            reverseOrder={false}
            toastOptions={{
              style: {
                borderRadius: '8px',
                background: '#111827',
                color: '#F9FAFB',
                border: '1px solid #374151',
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: 'white' },
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: 'white' },
              },
            }}
          />
          <div className="flex-grow">
            {children}
          </div>
          <footer className="bg-secondary text-secondary-foreground p-4 text-center">
            <p className="text-sm">© 2025 Arc Liem. All rights reserved.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
