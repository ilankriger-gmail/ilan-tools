import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://gsxanzgwstlpfvnqcmiu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeGFuemd3c3RscGZ2bnFjbWl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY2NjIwMiwiZXhwIjoyMDgzMjQyMjAyfQ.PUdvFWSOBPbs09hQzv0wK_XF-VaeJo5R9qYrMLoGW1g';

async function query(table: string, filter: string = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=id${filter ? '&' + filter : ''}`;
  
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    next: { revalidate: 60 }, // Cache for 1 minute
  });
  
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

export async function GET() {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const [resgates, participacoes, bugs, posts24h, users24h, hearts24h, comments24h] = await Promise.all([
      query('reward_claims', 'status=eq.pending'),
      query('challenge_participants', 'status=eq.pending'),
      query('bug_reports', 'status=eq.open'),
      query('posts', `created_at=gte.${yesterday}`),
      query('users', `created_at=gte.${yesterday}`),
      query('post_likes', `created_at=gte.${yesterday}`),
      query('comments', `created_at=gte.${yesterday}`),
    ]);

    return NextResponse.json({
      resgates,
      participacoes,
      bugs,
      posts24h,
      users24h,
      hearts24h,
      comments24h,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
