'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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


const PasswordStrengthIndicator = ({ password }) => {
    const requirements = [
        { id: 1, regex: /.{8,}/, text: "Minimal 8 karakter" },
        { id: 2, regex: /[A-Z]/, text: "Satu huruf besar" },
        { id: 3, regex: /[a-z]/, text: "Satu huruf kecil" },
        { id: 4, regex: /\d/, text: "Satu angka" },
        { id: 5, regex: /[@$!%*?&]/, text: "Satu simbol" },
    ];

    return (
        <div className="space-y-1 mt-2">
            {requirements.map(req => {
                const isValid = req.regex.test(password);
                return (
                    <div key={req.id} className={`flex items-center text-xs transition-colors ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isValid ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                        </svg>
                        <span>{req.text}</span>
                    </div>
                );
            })}
        </div>
    );
};


export default function RegisterPage() {
  const [userData, setUserData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Registrasi berhasil! Silakan login.');
      router.push('/login');

    } catch (err) {
      toast.error(err.message || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center font-heading text-card-foreground">Buat Akun Baru</h1>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label-form">Nama</label>
            <input name="name" type="text" required value={userData.name} onChange={handleInputChange} className="input-form"/>
          </div>
          <div>
            <label className="label-form">Alamat Email</label>
            <input name="email" type="email" required value={userData.email} onChange={handleInputChange} className="input-form"/>
          </div>
          <div>
            <label className="label-form">Password</label>
            <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} required value={userData.password} onChange={handleInputChange} className="input-form pr-10"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"><EyeIcon show={showPassword} className="h-5 w-5" /></button>
            </div>
            <PasswordStrengthIndicator password={userData.password} />
          </div>
          <div>
            <label className="label-form">Konfirmasi Password</label>
            <div className="relative">
                <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={userData.confirmPassword} onChange={handleInputChange} className="input-form pr-10"/>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"><EyeIcon show={showConfirmPassword} className="h-5 w-5" /></button>
            </div>
          </div>
          <div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
