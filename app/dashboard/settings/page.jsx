'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { ranks } from '@/lib/ranks';


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
              {isValid ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
            </svg>
            <span>{req.text}</span>
          </div>
        );
      })}
    </div>
  );
};


const validatePassword = (password) => {
  const requirements = [
    { regex: /.{8,}/, message: "Password harus minimal 8 karakter." },
    { regex: /[A-Z]/, message: "Password harus mengandung huruf besar." },
    { regex: /[a-z]/, message: "Password harus mengandung huruf kecil." },
    { regex: /\d/, message: "Password harus mengandung angka." },
    { regex: /[@$!%*?&]/, message: "Password harus mengandung simbol (@$!%*?&)." },
  ];
  for (const requirement of requirements) {
    if (!requirement.regex.test(password)) return requirement.message;
  }
  return null;
};

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


const ProfileCardAvatar = ({ name, rank }) => {
  const avatarUrl = `https://robohash.org/${encodeURIComponent(name || 'user')}?set=set4&bgset=bg1&size=128x128`;
  return (
    <div className="relative w-28 h-28">
      <img
        src={avatarUrl}
        alt={`Avatar untuk ${name}`}
        className="h-full w-full rounded-full object-cover shadow-md bg-gray-200 dark:bg-gray-700"
      />
      {rank && (
        <img
          src={rank.frameUrl}
          alt={`${rank.name} Frame`}
          className="absolute inset-0 h-full w-full transform scale-[1.60] pointer-events-none"
        />
      )}
    </div>
  );
};


const RankProgressBar = ({ points, currentRank }) => {
  const currentRankIndex = ranks.findIndex(r => r.name === currentRank.name);
  const nextRank = ranks[currentRankIndex + 1];

  if (!nextRank) {
    return (
      <div className="text-center">
        <img src={currentRank.badgeUrl} alt={currentRank.name} className="h-20 mx-auto" />
        <p className="font-bold text-green-400 mt-2">Peringkat Maksimal!</p>
      </div>
    );
  }

  const pointsForNextRank = nextRank.pointsRequired - (currentRank.pointsRequired || 0);
  const userProgress = points - (currentRank.pointsRequired || 0);
  const progressPercentage = Math.min((userProgress / pointsForNextRank) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-4">
        <div className="text-center flex-shrink-0 w-20">
          <img src={currentRank.badgeUrl} alt={currentRank.name} className="h-16 mx-auto" />
          <p className="text-xs font-semibold mt-1">{currentRank.name}</p>
        </div>
        <div className="w-full">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%`, backgroundColor: currentRank.color }}
            ></div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-1">{points} / {nextRank.pointsRequired}</p>
        </div>
        <div className="text-center flex-shrink-0 w-20">
          <img src={nextRank.badgeUrl} alt={nextRank.name} className="h-16 mx-auto opacity-50" />
          <p className="text-xs font-semibold mt-1 opacity-50">{nextRank.name}</p>
        </div>
      </div>
    </div>
  );
};


const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const CONFIRM_WORD = 'HAPUS';

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (password) {
      onConfirm({ confirmationText, password });
    } else {
      toast.error("Password dibutuhkan untuk konfirmasi.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="card-settings p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-red-500">Hapus Akun</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Tindakan ini tidak dapat diurungkan. Semua data Anda akan dihapus secara permanen.
        </p>
        <div className="space-y-4 mt-4">
          <div>
            <label className="label-form">Untuk konfirmasi, ketik <strong className="text-red-500">{CONFIRM_WORD}</strong></label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="input-form mt-1"
            />
          </div>
          <div>
            <label className="label-form">Masukkan password Anda</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-form mt-1"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} disabled={isDeleting} className="btn-secondary">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting || confirmationText !== CONFIRM_WORD || !password}
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400/50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Menghapus...' : 'Saya mengerti, hapus akun saya'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { data: session } = useSession();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const userRank = session?.user?.rank;
  const userPoints = session?.user?.points;

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmNewPassword) {
      toast.error("Semua kolom password harus diisi.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }
    const passwordError = validatePassword(passwords.newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (passwords.newPassword === passwords.currentPassword) {
        toast.error("Password baru tidak boleh sama dengan password lama.");
        return;
    }

    setLoadingPassword(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Password berhasil diubah!");
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async ({ confirmationText, password }) => {
    if (confirmationText !== 'HAPUS' || !password) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Akun Anda telah berhasil dihapus.");
      setTimeout(() => signOut({ callbackUrl: '/' }), 2000);
    } catch (err) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  const cardStyle = userRank ? {
    backgroundImage: `linear-gradient(to bottom right, ${userRank.gradientColors[0]}, ${userRank.gradientColors[1]})`
  } : {};

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profil & Peringkat</h1>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card-settings p-6 flex flex-col items-center text-center relative overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg rounded-lg"
            style={cardStyle}>

            {userRank && <ProfileCardAvatar name={session?.user?.name} rank={userRank} />}

            <h2 className={`text-2xl font-bold mt-5 ${userRank?.nameColorClass}`}>{session?.user?.name}</h2>
            <div className="flex gap-4 mt-5">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{userPoints}</p>
                <p className="text-xs text-white/70">Poin</p>
              </div>
              <div className="border-l border-white/20"></div>

              <div className="text-center">

                <p className="text-2xl font-bold text-yellow-400">{session?.user?.credits}</p>

                <p className="text-xs text-white/70">Kredit</p>

              </div>
            </div>

            <div className="w-full flex flex-col items-center">
              <p className="text-lg font-semibold text-black-400 mt-5 mb-1">Rank:</p>
              {userRank && <img src={userRank.badgeUrl} alt={`${userRank.name} Badge`} className="h-20" />}
              <p className={`font-bold text-lg mb-5 mt-2`} style={userRank ? { color: userRank.color } : {}}>{userRank?.name}</p>
            </div>

            <p className="text-xs text-center text-black-400 italic pt-4 border-t border-white/50 light:border-gray-700 w-full">
              Download lebih banyak jurnal untuk mendapatkan poin!
            </p>

          </div>

        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="card-settings p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">User Information</h3>
            <form className="space-y-4">
              <div>
                <label className="label-form">Name</label>
                <input type="text" value={session?.user?.name || ''} readOnly className="input-form-disabled" />
              </div>
              <div>
                <label className="label-form">Email</label>
                <input type="email" value={session?.user?.email || ''} readOnly className="input-form-disabled" />
              </div>
            </form>
          </div>
          <div className="card-settings p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">Rank Journey</h3>
            {userRank && <RankProgressBar points={userPoints} currentRank={userRank} />}
          </div>
          <div className="card-settings p-8">
            <h3 className="text-lg font-semibold ... pb-4 mb-6">Ganti Password</h3>
            <form onSubmit={handleSubmitPassword} className="space-y-4" noValidate>
              <div>
                <label className="label-form">Password Saat Ini</label>
                <div className="relative">
                  <input type={showCurrentPassword ? 'text' : 'password'} value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="input-form pr-10" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"><EyeIcon show={showCurrentPassword} className="h-5 w-5" /></button>
                </div>
              </div>
              <div>
                <label className="label-form">Password Baru</label>
                <div className="relative mt-1">
                  <input type={showNewPassword ? 'text' : 'password'} value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="input-form pr-10"/>
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"><EyeIcon show={showNewPassword} className="h-5 w-5" /></button>
                </div>
                <PasswordStrengthIndicator password={passwords.newPassword} />
              </div>
              <div>
                <label className="label-form">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmNewPassword ? 'text' : 'password'} value={passwords.confirmNewPassword} onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })} className="input-form pr-10" />
                  <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"><EyeIcon show={showConfirmNewPassword} className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={loadingPassword} className="btn-primary">
                  {loadingPassword ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
          <div className="card-settings border-red-500/50 p-6">
            <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">Hapus Akun Anda</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tindakan ini tidak dapat diurungkan.</p>
                </div>
                <button onClick={() => setDeleteModalOpen(true)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
                  Hapus Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
