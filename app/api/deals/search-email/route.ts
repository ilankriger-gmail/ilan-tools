import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { supabase } from '../../../../lib/supabase';

const GOG_PATH = '/opt/homebrew/bin/gog';

export async function GET() {
  try {
    // Search for proposal emails from the last 6 hours
    const query = 'newer_than:6h (proposta OR parceria OR publi OR campanha OR orçamento OR comercial OR briefing)';
    const cmd = `${GOG_PATH} gmail messages search "${query}" --max 10 --account ilankriger@gmail.com --json`;

    let rawOutput: string;
    try {
      rawOutput = execSync(cmd, { timeout: 30000, encoding: 'utf-8' });
    } catch {
      return NextResponse.json({ message: 'gog command failed or not available', created: 0 });
    }

    let emails: Array<{
      id?: string;
      subject?: string;
      from?: string;
      snippet?: string;
      date?: string;
    }>;
    try {
      emails = JSON.parse(rawOutput);
    } catch {
      return NextResponse.json({ message: 'Failed to parse gog output', raw: rawOutput.slice(0, 500), created: 0 });
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ message: 'No new emails found', created: 0 });
    }

    // Get existing deals to avoid duplicates
    const { data: existingDeals } = await supabase
      .from('deals')
      .select('brand, email');

    const existingEmails = new Set((existingDeals || []).map(d => d.email?.toLowerCase()).filter(Boolean));
    const existingBrands = new Set((existingDeals || []).map(d => d.brand?.toLowerCase()).filter(Boolean));

    const created: string[] = [];

    for (const email of emails) {
      const fromEmail = extractEmail(email.from || '');
      const fromName = extractName(email.from || '');
      const brand = guessBrand(email.subject || '', fromName);

      // Skip if we already have a deal with this email or brand
      if (fromEmail && existingEmails.has(fromEmail.toLowerCase())) continue;
      if (brand && existingBrands.has(brand.toLowerCase())) continue;

      // Create new deal
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const { error } = await supabase.from('deals').insert({
        id,
        brand: brand || fromName || 'Unknown',
        contact: fromName || '',
        email: fromEmail || '',
        value: 0,
        stage: 'inbox',
        platform: '',
        deliverables: email.subject || '',
        deadline: null,
        notes: `Auto-imported from email.\nSubject: ${email.subject}\nSnippet: ${email.snippet?.slice(0, 200)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        created.push(brand || fromName || 'Unknown');
        existingEmails.add(fromEmail?.toLowerCase() || '');
        existingBrands.add(brand?.toLowerCase() || '');
      }
    }

    return NextResponse.json({
      message: `Processed ${emails.length} emails, created ${created.length} new deals`,
      created: created.length,
      newDeals: created,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/) || from.match(/([^\s]+@[^\s]+)/);
  return match ? match[1] : '';
}

function extractName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from.replace(/<.*>/, '').trim();
}

function guessBrand(subject: string, fromName: string): string {
  // Try to extract brand name from subject
  const patterns = [
    /parceria\s+(?:com\s+)?(?:a\s+)?(.+?)(?:\s*[-–|]|\s*$)/i,
    /proposta\s+(?:comercial\s+)?(?:para\s+)?(.+?)(?:\s*[-–|]|\s*$)/i,
    /campanha\s+(.+?)(?:\s*[-–|]|\s*$)/i,
  ];
  for (const p of patterns) {
    const m = subject.match(p);
    if (m && m[1].trim().length > 1 && m[1].trim().length < 50) {
      return m[1].trim();
    }
  }
  return fromName || '';
}
