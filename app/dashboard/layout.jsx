'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from "next/navigation";
import { useState } from 'react';


const UserAvatar = ({ name }) => {
  const avatarUrl = `https://robohash.org/${encodeURIComponent(name || 'user')}?set=set4&size=48x48`;
  return (
    <img src={avatarUrl} alt={`Avatar untuk ${name}`} className="h-8 w-8 rounded-full object-cover" />
  );
};


const sidebarLinks = [
  { 
    name: 'Pengaturan Akun', 
    href: '/dashboard/settings', 
    icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
  },
  { 
    name: 'Riwayat Download', 
    href: '/dashboard/history', 
    icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
  },
  { 
    name: 'Riwayat Transaksi', 
    href: '/dashboard/transactions', 
    icon: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { redirect('/login'); },
  });
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">Memuat...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <aside className={`fixed top-0 left-0 h-full z-10 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-500">Arc Liem</Link>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
          </button>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.name} href={link.href} title={link.name} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                <link.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
           <Link href="/" title="Kembali ke Pencarian" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            {!isCollapsed && <span>Kembali</span>}
          </Link>
        </div>
      </aside>

      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          {children}
        </main>
        
      </div>
    </div>
  );
}
