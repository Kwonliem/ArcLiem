'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';


const SkeletonCard = () => (
  <div className="p-5 bg-card border border-border rounded-lg shadow-sm animate-pulse">
    <div className="h-6 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
    <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
    <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
  </div>
);


const LogoutModal = ({ isOpen, onClose, onConfirm, isLoggingOut }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full border border-border">
        <h2 className="text-xl font-heading font-bold text-card-foreground">Konfirmasi Logout</h2>
        <p className="mt-2 text-muted-foreground">Apakah Anda yakin ingin keluar?</p>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} disabled={isLoggingOut} className="btn-secondary">Batal</button>
          <button onClick={onConfirm} disabled={isLoggingOut} className="bg-destructive text-destructive-foreground font-semibold px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-wait">
            {isLoggingOut ? 'Memproses...' : 'Ya, Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};


const NavbarAvatar = ({ name, rank }) => {
  const avatarUrl = `https://robohash.org/${encodeURIComponent(name || 'user')}?set=set4&size=64x64`;
  return (
    <div className="relative w-10 h-10">
      <img src={avatarUrl} alt={`Avatar untuk ${name}`} className="h-full w-full rounded-full object-cover bg-muted shadow-md" />
      {rank && (
        <img src={rank.frameUrl} alt={`${rank.name} Frame`} className="absolute inset-0 h-full w-full transform scale-[1.60] pointer-events-none" />
      )}
    </div>
  );
};


const InsufficientCreditsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="relative text-center bg-gradient-to-br from-blue-900 via-purple-900 to-black p-8 rounded-2xl shadow-2xl border border-purple-500/50 max-w-md w-full">
        <h2 className="text-4xl font-heading font-bold text-white mb-2">Kredit Habis!</h2>
        <p className="text-purple-200 mb-6">Anda membutuhkan lebih banyak kredit untuk melanjutkan download.</p>
        <Link href="/pricing" className="btn-primary text-lg px-8 py-3 animate-pulse">
          Beli Kredit Sekarang
        </Link>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
      </div>
    </div>
  );
};



function HomePageContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isInsufficientCreditsModalOpen, setInsufficientCreditsModalOpen] = useState(false);

  const handleSearch = async (searchQueryParam) => {
    const currentQuery = typeof searchQueryParam === 'string' ? searchQueryParam : query;
    if (!currentQuery.trim()) {
      toast.error("Kolom pencarian tidak boleh kosong.");
      return;
    }
    router.push(`/?q=${encodeURIComponent(currentQuery)}`, { scroll: false });
    setLoading(true);
    setResults([]);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(currentQuery)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data');
      }
      const data = await response.json();
      setResults(data.results || []);
      if ((data.results || []).length === 0) {
        toast.error("Tidak ada artikel yang ditemukan untuk query tersebut.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      handleSearch(urlQuery);
    }

  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const handleDownload = async (article) => {
    if (!session) {
      toast.error("Anda harus login untuk download.");
      router.push('/login');
      return;
    }
    if (session.user.credits < 20) {
      setInsufficientCreditsModalOpen(true);
      return;
    }
    const oldRank = session.user.rank;
    const downloadLink = article.downloadUrl;
    setDownloading(article.id);
    try {
      const creditRes = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article }),
      });
      const creditData = await creditRes.json();
      if (!creditRes.ok) throw new Error(creditData.message);
      toast.success('Download berhasil! Kredit -20, Poin +20 ✨');
      const newSession = await update();
      const newRank = newSession?.user?.rank;
      if (newRank && oldRank && newRank.name !== oldRank.name) {
        setTimeout(() => {
          toast.success(`SELAMAT! Anda mencapai peringkat ${newRank.name}!`, {
            icon: '🎉',
            duration: 5000,
          });
        }, 1000);
      }
      const pdfRes = await fetch('/api/fetch-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadUrl: downloadLink }),
      });
      if (pdfRes.ok) {
        const blob = await pdfRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const fileName = `${article.title.substring(0, 50).replace(/[^a-z0-9]/gi, '_')}.pdf`;
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await pdfRes.json();
        if (errorData.errorType === 'NOT_A_PDF' || errorData.errorType === 'FORBIDDEN') {
          toast.success("Membuka halaman sumber di tab baru...");
          window.open(downloadLink, '_blank', 'noopener,noreferrer');
        } else {
          throw new Error(errorData.message || 'Gagal mengunduh file.');
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(null);
    }
  };

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    toast.success('Anda telah berhasil logout.');
    setTimeout(() => {
      signOut({ callbackUrl: '/login' });
    }, 1500);
  };

  const handleOpenLogoutModal = () => {
    setIsLoggingOut(false);
    setLogoutModalOpen(true);
  }

  return (
    <>
      <InsufficientCreditsModal isOpen={isInsufficientCreditsModalOpen} onClose={() => setInsufficientCreditsModalOpen(false)} />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="flex min-h-screen flex-col items-center pb-24 bg-background text-foreground">
        <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8 sticky top-0 bg-background/80 backdrop-blur-sm z-20">
          <div className="pl-4">
            <Link href="/" className="text-xl font-bold font-heading text-primary">Arc Liem</Link>
          </div>
          <nav className="flex items-center gap-4 pr-4">
            {status === "loading" ? (
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
            ) : session ? (
              <>
                <Link href="/pricing" className="btn-secondary text-sm font-semibold">
                  Beli Kredit
                </Link>
                <div className="flex items-center gap-2 bg-yellow-400/20 dark:bg-yellow-400/10 border border-yellow-500/30 rounded-full px-3 py-1.5 text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>

                  <span>{session.user.credits}</span>
                </div>
                {session.user.rank && (
                  <img src={session.user.rank.badgeUrl} alt={session.user.rank.name} className="h-9" title={`Peringkat: ${session.user.rank.name}`} />
                )}
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2">
                    <NavbarAvatar name={session.user.name} rank={session.user.rank} />
                  </button>
                  <div className={`absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg py-1 z-20 border border-border transition-all ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-card-foreground" >{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate" >{session.user.email}</p>
                    </div>
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">Pengaturan</Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); setDropdownOpen(false); handleOpenLogoutModal(); }} className="block px-4 py-2 text-sm text-destructive-foreground hover:bg-muted">Logout</a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-foreground hover:text-accent">Login</Link>
                <Link href="/register" className="btn-primary">Register</Link>
              </>
            )}
          </nav>
        </header>

        <div className="w-full text-center mb-10 pt-24">
          <h1 className="text-5xl md:text-6xl font-bold font-heading text-primary">Arc Liem</h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">Open Access, Open Mind, Open Future.</p>
        </div>

        <div className="w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Cari berdasarkan kata kunci atau DOI..." className="input-form flex-grow p-4" disabled={loading} />
            <button onClick={handleSearch} disabled={loading} className="btn-primary px-8 py-4">
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </div>
        </div>

        <div className="w-full max-w-3xl mt-8">

          {status === 'unauthenticated' && (
            <div className="p-4 mb-6 text-sm text-blue-200 bg-blue-900/50 border border-blue-500/30 rounded-lg text-center" role="alert">
              <Link href="/login" className="font-bold underline">Login</Link> atau <Link href="/register" className="font-bold underline">daftar</Link> untuk bisa men-download jurnal dan mendapatkan poin!
            </div>
          )}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : (
            results.length > 0 && (
              <div className="space-y-4">
                {results.map((item) => (
                  <div key={item.id} className="p-5 bg-card border border-border rounded-lg shadow-sm transition-all hover:border-accent">
                    <h2 className="text-xl font-semibold font-heading text-primary">{item.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.authors?.join(', ') || 'Penulis tidak diketahui'} ({item.yearPublished || 'Tahun tidak diketahui'})
                    </p>
                    <p className="mt-3 text-foreground/80 leading-relaxed">{item.abstract}</p>
                    {session && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end items-center">
                        {item.isOpenAccess ? (
                          <button onClick={() => handleDownload(item)} disabled={downloading === item.id} className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500">
                            {downloading === item.id ? 'Memproses...' : 'Download PDF (20 Kredit)'}
                          </button>
                        ) : (
                          <div className="text-right">
                            <div className="inline-block bg-muted text-muted-foreground text-sm font-medium px-4 py-2 rounded-lg">
                              Versi Open Access tidak ditemukan
                            </div>
                            {item.publisherUrl && (
                              <a href={item.publisherUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-accent hover:underline mt-1">
                                Lihat di situs publisher
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen bg-background">
          <p className="text-lg font-heading text-foreground">Memuat halaman...</p>
        </div>
      }>
        <HomePageContent />
      </Suspense>
    </>
  );
}
