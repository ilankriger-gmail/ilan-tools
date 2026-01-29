// Seed existing deals from deals-data.json into Supabase
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gsxanzgwstlpfvnqcmiu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeGFuemd3c3RscGZ2bnFjbWl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY2NjIwMiwiZXhwIjoyMDgzMjQyMjAyfQ.PUdvFWSOBPbs09hQzv0wK_XF-VaeJo5R9qYrMLoGW1g'
);

const deals = JSON.parse(readFileSync(new URL('../public/deals-data.json', import.meta.url), 'utf-8'));

async function seed() {
  for (const d of deals) {
    const row = {
      id: d.id,
      brand: d.brand,
      contact: d.contact || '',
      email: d.email || '',
      value: d.value || 0,
      stage: d.stage,
      platform: d.platform || '',
      deliverables: d.deliverables || '',
      deadline: d.deadline || null,
      notes: d.notes || '',
      lost_reason: d.lostReason || null,
      rejected_reason: d.rejectedReason || null,
      created_at: d.createdAt || new Date().toISOString(),
      updated_at: d.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase.from('deals').upsert(row);
    if (error) {
      console.error(`❌ ${d.brand}:`, error.message);
    } else {
      console.log(`✅ ${d.brand}`);
    }
  }
  console.log(`\nDone! Seeded ${deals.length} deals.`);
}

seed();
