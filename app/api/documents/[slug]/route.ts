import { NextRequest, NextResponse } from 'next/server';
import { getDocumentBySlug } from '@/lib/documents';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const doc = getDocumentBySlug(slug);
  
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  
  return NextResponse.json(doc);
}
