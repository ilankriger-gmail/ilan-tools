import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, getStats, getFolderTree } from '@/lib/documents';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const view = searchParams.get('view');
  
  if (view === 'stats') {
    return NextResponse.json(getStats());
  }
  
  if (view === 'tree') {
    return NextResponse.json(getFolderTree());
  }
  
  let docs = getAllDocuments();
  
  // Strip content for list view
  const listDocs = docs.map(({ content, ...rest }) => rest);
  
  let filtered = listDocs;
  
  if (type) {
    filtered = filtered.filter(d => d.type === type);
  }
  
  if (tag) {
    filtered = filtered.filter(d => d.tags.includes(tag));
  }
  
  if (search) {
    const q = search.toLowerCase();
    // Need to search in content too
    const fullDocs = docs;
    const matchingSlugs = new Set(
      fullDocs
        .filter(d => 
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q) ||
          d.tags.some(t => t.toLowerCase().includes(q)) ||
          d.summary.toLowerCase().includes(q)
        )
        .map(d => d.slug)
    );
    filtered = filtered.filter(d => matchingSlugs.has(d.slug));
  }
  
  return NextResponse.json(filtered);
}
