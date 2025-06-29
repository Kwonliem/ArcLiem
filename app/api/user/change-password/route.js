import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


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


export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
  }
  
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }

  await dbConnect();

  try {
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Password saat ini salah." }, { status: 403 });
    }
    
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        return NextResponse.json({ message: "Password baru tidak boleh sama dengan password lama." }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return NextResponse.json({ message: "Password berhasil diubah." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
