import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';


const validatePassword = (password) => {
  const requirements = [
    { regex: /.{8,}/, message: "Minimal 8 karakter." },
    { regex: /[A-Z]/, message: "Harus mengandung huruf besar." },
    { regex: /[a-z]/, message: "Harus mengandung huruf kecil." },
    { regex: /\d/, message: "Harus mengandung angka." },
    { regex: /[@$!%*?&]/, message: "Harus mengandung simbol (@$!%*?&)." },
  ];
  
  for (const requirement of requirements) {
    if (!requirement.regex.test(password)) {
      return requirement.message;
    }
  }
  return null; 
};

export async function POST(request) {
  try {
    const { name, email, password, confirmPassword } = await request.json();

    
    if (!name || !email || !password || !confirmPassword) {
        return NextResponse.json({ message: "Semua kolom harus diisi." }, { status: 400 });
    }
    if (password !== confirmPassword) {
        return NextResponse.json({ message: "Password dan konfirmasi password tidak cocok." }, { status: 400 });
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
        return NextResponse.json({ message: `Password lemah: ${passwordError}` }, { status: 400 });
    }

    
    
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email ini sudah terdaftar." }, { status: 409 });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "Akun berhasil dibuat!" }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
