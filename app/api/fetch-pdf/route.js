import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { downloadUrl } = await request.json();
    if (!downloadUrl) {
      return NextResponse.json({ message: "URL download dibutuhkan." }, { status: 400 });
    }

    const pdfResponse = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    
    if (pdfResponse.status === 403) {
      console.warn(`Akses ditolak (403) untuk URL: ${downloadUrl}`);
      return NextResponse.json({ 
        errorType: 'FORBIDDEN',
        message: 'Akses ke sumber file ditolak.' 
      }, { status: 403 });
    }

    if (!pdfResponse.ok) {
      throw new Error(`Gagal mengambil file dari sumber: Status ${pdfResponse.status}`);
    }

    const contentType = pdfResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      return NextResponse.json({ 
        errorType: 'NOT_A_PDF',
        message: 'Sumber bukan file PDF, melainkan halaman web.' 
      }, { status: 415 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const headers = new Headers();
    headers.append('Content-Type', 'application/pdf');
    headers.append('Content-Disposition', `attachment; filename="arc-liem-article.pdf"`);
    
    return new NextResponse(pdfBuffer, { status: 200, headers: headers });

  } catch (error) {
    console.error("Fetch PDF Error:", error);
    return NextResponse.json({ message: `Terjadi kesalahan: ${error.message}` }, { status: 500 });
  }
}