import { NextResponse } from 'next/server';
import { getRankByPoints } from '@/lib/ranks';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

export async function GET(request) {
  console.log("\n--- Menerima Request Pencarian Baru ---");
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ message: 'Query pencarian dibutuhkan' }, { status: 400 });
    }

    if (query.startsWith('doi:')) {
      const doi = query.substring(4);
      console.log(`Pencarian terdeteksi sebagai DOI: ${doi}. Memulai proses pengayaan data...`);

      const unpaywallUrl = `https://api.unpaywall.org/v2/${doi}?email=liemyoesuf@gmail.com`;
      const coreUrl = `https://api.core.ac.uk/v3/search/works?q=doi:${doi}`;
      const coreApiKey = process.env.CORE_API_KEY;

      const [unpaywallRes, coreRes] = await Promise.all([
        fetch(unpaywallUrl),
        fetch(coreUrl, { headers: { 'Authorization': `Bearer ${coreApiKey}` } })
      ]);

      console.log(`Status Unpaywall: ${unpaywallRes.status}, Status CORE: ${coreRes.status}`);

      if (!unpaywallRes.ok && !coreRes.ok) {
        throw new Error(`Tidak dapat menemukan informasi untuk DOI ${doi} dari sumber manapun.`);
      }

      const unpaywallData = unpaywallRes.ok ? await unpaywallRes.json() : {};
      const coreData = coreRes.ok ? await coreRes.json() : {};
      const coreResult = coreData.results?.[0];

      const finalResult = {
        id: doi,
        title: coreResult?.title || unpaywallData?.title || "Judul tidak ditemukan",
        authors: (coreResult?.authors && Array.isArray(coreResult.authors) && coreResult.authors.length > 0)
          ? coreResult.authors.map(author => typeof author === 'object' ? author.name : author).filter(Boolean)
          : (unpaywallData?.z_authors ? unpaywallData.z_authors.map(a => `${a.given || ''} ${a.family || ''}`.trim()) : []),
        yearPublished: coreResult?.yearPublished || (unpaywallData?.published_date ? new Date(unpaywallData.published_date).getFullYear() : null),
        abstract: coreResult?.abstract || unpaywallData?.abstract || "Abstrak tidak tersedia.",
        isOpenAccess: !!unpaywallData?.best_oa_location?.url_for_pdf,
        downloadUrl: unpaywallData?.best_oa_location?.url_for_pdf || null,
        urls: { pdf: unpaywallData?.best_oa_location?.url_for_pdf || null },
        publisherUrl: unpaywallData?.doi_url,
      };

      
      return NextResponse.json({ results: [finalResult], totalHits: 1 });

    } else {
      
      console.log("Pencarian terdeteksi sebagai kata kunci. Menggunakan CORE API...");
      
      const apiKey = process.env.CORE_API_KEY;
      if (!apiKey) throw new Error("CORE_API_KEY tidak dikonfigurasi.");

      
      const finalQuery = query;
      console.log("Query Final ke CORE:", finalQuery);

      const coreUrl = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(finalQuery)}&limit=40`;
      
      const response = await fetch(coreUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
      
      if (!response.ok) throw new Error(`CORE API merespons dengan error: ${response.status}`);
      
      const data = await response.json();
      
      let processedResults = data.results.map(item => {
        return {
          ...item,
          authors: (item.authors && Array.isArray(item.authors))
            ? item.authors.map(author => author.name || author)
            : [],
          isOpenAccess: !!item.downloadUrl
        };
      });

      processedResults.sort((a, b) => {
        return (b.isOpenAccess ? 1 : 0) - (a.isOpenAccess ? 1 : 0);
      });

      return NextResponse.json({ results: processedResults, totalHits: data.totalHits });
    }

  } catch (error) {
    console.error("Terjadi Error di API Search:", error.message);
    return NextResponse.json({ message: error.message || 'Terjadi kesalahan pada server kami' }, { status: 500 });
  }
}
