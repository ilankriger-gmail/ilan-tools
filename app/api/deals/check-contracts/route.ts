import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { supabase } from '../../../../lib/supabase';

const GOG_PATH = '/opt/homebrew/bin/gog';

export async function GET() {
  try {
    const query = 'newer_than:24h (contrato assinado OR nota fiscal OR NF emitida OR invoice)';
    const cmd = `${GOG_PATH} gmail messages search "${query}" --max 10 --account ilankriger@gmail.com --json`;

    let rawOutput: string;
    try {
      rawOutput = execSync(cmd, { timeout: 30000, encoding: 'utf-8' });
    } catch {
      return NextResponse.json({ message: 'gog command failed or not available', updated: 0 });
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
      return NextResponse.json({ message: 'Failed to parse gog output', raw: rawOutput.slice(0, 500), updated: 0 });
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ message: 'No contract/invoice emails found', updated: 0 });
    }

    // Get all active deals
    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .not('stage', 'in', '(paid,lost,rejected)');

    if (!deals || deals.length === 0) {
      return NextResponse.json({ message: 'No active deals to match', updated: 0 });
    }

    const updated: string[] = [];

    for (const email of emails) {
      const fromEmail = extractEmail(email.from || '');
      const subject = (email.subject || '').toLowerCase();
      const snippet = (email.snippet || '').toLowerCase();
      const content = subject + ' ' + snippet;

      // Try to match with existing deals
      const matchedDeal = deals.find(d => {
        if (d.email && fromEmail && d.email.toLowerCase() === fromEmail.toLowerCase()) return true;
        if (d.brand && (content.includes(d.brand.toLowerCase()) || subject.includes(d.brand.toLowerCase()))) return true;
        if (d.contact && d.contact.length > 3 && content.includes(d.contact.toLowerCase())) return true;
        return false;
      });

      if (!matchedDeal) continue;

      // Determine which stage to move to
      let newStage: string | null = null;
      if (content.includes('nota fiscal') || content.includes('nf emitida') || content.includes('invoice')) {
        newStage = 'invoice_sent';
      } else if (content.includes('contrato assinado') || content.includes('contrato firmado')) {
        newStage = 'contract_signed';
      }

      if (!newStage) continue;

      // Only move forward (don't move back)
      const stageOrder = ['inbox', 'evaluating', 'negotiating', 'contracted', 'delivered', 'contract_signed', 'invoice_sent', 'paid'];
      const currentIdx = stageOrder.indexOf(matchedDeal.stage);
      const newIdx = stageOrder.indexOf(newStage);
      if (newIdx <= currentIdx) continue;

      const { error } = await supabase
        .from('deals')
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq('id', matchedDeal.id);

      if (!error) {
        updated.push(`${matchedDeal.brand} → ${newStage}`);
      }
    }

    return NextResponse.json({
      message: `Processed ${emails.length} emails, updated ${updated.length} deals`,
      updated: updated.length,
      changes: updated,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/) || from.match(/([^\s]+@[^\s]+)/);
  return match ? match[1] : '';
}
