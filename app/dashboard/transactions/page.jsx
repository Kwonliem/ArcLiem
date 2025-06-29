'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';


const StatusBadge = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  let specificClasses = "";

  switch (status) {
    case 'success':
      specificClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      break;
    case 'pending':
      specificClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      break;
    case 'failed':
      specificClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      break;
    default:
      specificClasses = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
  return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
};


const TransactionHistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/user/transactions');
            if (!res.ok) {
                throw new Error("Gagal memuat riwayat transaksi.");
            }
            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Riwayat Transaksi</h1>
                
                <button onClick={() => { setLoading(true); fetchHistory(); }} disabled={loading} className="btn-secondary text-sm">
                    {loading ? 'Memuat...' : 'Refresh Status'}
                </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                Status pembayaran akan diperbarui secara otomatis. Jika status masih 'pending' setelah beberapa menit, Anda bisa mengklik tombol 'Refresh Status'.
            </div>
            
            <div className="card-settings overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Paket</th>
                            <th scope="col" className="px-6 py-3">Jumlah</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                                </tr>
                            ))
                        ) : transactions.length > 0 ? (
                            transactions.map(item => (
                                <tr key={item._id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-mono text-xs text-gray-900 dark:text-white">
                                        {item.midtransOrderId}
                                    </th>
                                    <td className="px-6 py-4 font-semibold">
                                        {item.credits} Kredit
                                    </td>
                                    <td className="px-6 py-4 font-semibold">
                                        Rp{item.amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-8">
                                    Anda belum memiliki riwayat transaksi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistoryPage;
