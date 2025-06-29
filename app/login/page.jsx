'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const EyeIcon = ({ show, ...props }) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      {show ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
    </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password harus diisi.");
      return;
    }
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      
      if (result.error) {
        if (result.error === "USER_NOT_FOUND") {
          toast.error("Akun tidak ditemukan. Silakan registrasi terlebih dahulu.");
        } else {
          toast.error("Email atau password salah.");
        }
      } else {
        toast.success('Login berhasil!');
        router.push('/');
      }
    } catch (err) {
        toast.error('Terjadi kesalahan tak terduga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center font-heading text-card-foreground">Masuk ke Akun</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label className="label-form">Alamat Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-form"/>
          </div>
          <div>
            <label className="label-form">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="input-form pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
              >
                  <EyeIcon show={showPassword} className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
        
        <p className="text-sm text-center text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
