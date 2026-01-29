import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// GET: Fetch all deals
export async function GET() {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform snake_case to camelCase for frontend compatibility
  const deals = (data || []).map(dbToFrontend);
  return NextResponse.json(deals);
}

// POST: Create a new deal
export async function POST(req: NextRequest) {
  const body = await req.json();
  const row = frontendToDb(body);

  const { data, error } = await supabase
    .from('deals')
    .insert(row)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(dbToFrontend(data));
}

// PUT: Update a deal
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = frontendToDb(body);

  const { data, error } = await supabase
    .from('deals')
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(dbToFrontend(data));
}

// DELETE: Delete a deal
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ============================================================
// Helpers: transform between frontend camelCase and DB snake_case
// ============================================================

interface DbDeal {
  id: string;
  brand: string;
  contact: string;
  email: string;
  value: number;
  stage: string;
  platform: string;
  deliverables: string;
  deadline: string | null;
  notes: string;
  lost_reason: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface FrontendDeal {
  id: string;
  brand: string;
  contact: string;
  email: string;
  value: number;
  stage: string;
  platform: string;
  deliverables: string;
  deadline: string;
  notes: string;
  lostReason?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

function dbToFrontend(row: DbDeal): FrontendDeal {
  return {
    id: row.id,
    brand: row.brand,
    contact: row.contact || '',
    email: row.email || '',
    value: row.value || 0,
    stage: row.stage,
    platform: row.platform || '',
    deliverables: row.deliverables || '',
    deadline: row.deadline || '',
    notes: row.notes || '',
    lostReason: row.lost_reason || undefined,
    rejectedReason: row.rejected_reason || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function frontendToDb(deal: FrontendDeal): DbDeal {
  return {
    id: deal.id,
    brand: deal.brand,
    contact: deal.contact || '',
    email: deal.email || '',
    value: deal.value || 0,
    stage: deal.stage,
    platform: deal.platform || '',
    deliverables: deal.deliverables || '',
    deadline: deal.deadline || null,
    notes: deal.notes || '',
    lost_reason: deal.lostReason || null,
    rejected_reason: deal.rejectedReason || null,
    created_at: deal.createdAt || new Date().toISOString(),
    updated_at: deal.updatedAt || new Date().toISOString(),
  };
}
