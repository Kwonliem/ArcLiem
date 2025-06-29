import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import DownloadHistory from "@/models/DownloadHistory";
import { NextResponse } from 'next/server';

const DOWNLOAD_COST = 20;
const POINTS_PER_DOWNLOAD = 20;

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
  }

  const { article } = await request.json();
  if (!article || !article.id || !article.title) {
    return NextResponse.json({ message: "Data artikel tidak lengkap." }, { status: 400 });
  }

  await dbConnect();
  
  try {
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    
    
    if ((user.credits || 0) < DOWNLOAD_COST) {
        return NextResponse.json({ message: "Kredit Anda tidak cukup." }, { status: 402 }); 
    }
    
    
    user.credits -= DOWNLOAD_COST;
    user.points = (user.points || 0) + POINTS_PER_DOWNLOAD;
    
    await Promise.all([
        user.save(),
        DownloadHistory.create({
            userId: user._id,
            articleId: article.id.toString(),
            title: article.title,
            authors: article.authors || [],
            yearPublished: article.yearPublished || null,
        })
    ]);

    return NextResponse.json({ 
      message: "Download berhasil!",
    }, { status: 200 });

  } catch (error) {
    console.error("Download API Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
