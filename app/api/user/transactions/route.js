import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction"; 
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
  }

  await dbConnect();

  try {
    
    const transactions = await Transaction.find({ userId: session.user.id })
      .sort({ createdAt: -1 }) 
      .limit(100); 

    return NextResponse.json(transactions, { status: 200 });

  } catch (error) {
    console.error("Fetch transaction history error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
