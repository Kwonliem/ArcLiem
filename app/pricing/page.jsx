'use client';
import Link from 'next/link';

const ComingSoonPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-4">
            <h1 className="text-5xl font-heading font-bold mb-4">Coming Soon!</h1>
            <p className="text-lg text-gray-400 max-w-md mb-8">
                Fitur pembelian kredit sedang dalam pengembangan. Kami sedang bekerja keras untuk menyajikannya kepada Anda!
            </p>
            <p className="text-lg text-gray-400 max-w-md mb-8">
                Jika anda memiliki masalah atau kendalan, silahkan hubungi kami melalui email ke <a href="mailto:liemyoesuf@gmail.com" className="text-blue-400 hover:underline">liemyoesuf@gmail.com</a> 
            </p>
            <Link href="/" className="btn-primary">
                Kembali ke Halaman Utama
            </Link>
        </div>
    );
};

export default ComingSoonPage;
