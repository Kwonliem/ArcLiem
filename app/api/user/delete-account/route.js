import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
  }

  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ message: "Password dibutuhkan untuk konfirmasi." }, { status: 400 });
  }

  await dbConnect();

  try {
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Password yang Anda masukkan salah." }, { status: 403 });
    }

    
    await User.findByIdAndDelete(session.user.id);

    return NextResponse.json({ message: "Akun berhasil dihapus." }, { status: 200 });

  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
