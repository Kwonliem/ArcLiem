'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';


const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
    </tr>
);


const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/user/history');
                if (!res.ok) {
                    throw new Error("Gagal memuat riwayat.");
                }
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Riwayat Download</h1>
            
            <div className="card-settings overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Judul Artikel</th>
                            <th scope="col" className="px-6 py-3">Tahun</th>
                            <th scope="col" className="px-6 py-3">Tanggal Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : history.length > 0 ? (
                            history.map(item => (
                                <tr key={item._id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {item.title}
                                    </th>
                                    <td className="px-6 py-4">
                                        {item.yearPublished || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            
                            <tr>
                                <td colSpan="3" className="text-center py-8">
                                    Anda belum memiliki riwayat download.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryPage;
