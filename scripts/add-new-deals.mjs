// Add new deals discovered from email scan 2026-01-29
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const supabase = createClient(
  'https://gsxanzgwstlpfvnqcmiu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeGFuemd3c3RscGZ2bnFjbWl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY2NjIwMiwiZXhwIjoyMDgzMjQyMjAyfQ.PUdvFWSOBPbs09hQzv0wK_XF-VaeJo5R9qYrMLoGW1g'
);

const newDeals = [
  {
    id: "pagbank-2026-01",
    brand: "PagBank",
    contact: "Cliente direto (via Play9/Isabella)",
    email: "",
    value: 50000,
    stage: "contracted",
    platform: "Instagram Reels + TikTok",
    deliverables: "1 Reel com collab + repost no TikTok. Direito de repost pela marca. Sem direito de imagem, impulsionamento ou exclusividade.",
    deadline: "2026-01-28",
    notes: "Cliente direto. Publicação prevista 28/01. Veiculação 28/01. Valor R$50k. Sem diária. Contexto não informado.",
    created_at: "2026-01-29T10:24:00Z",
    updated_at: "2026-01-29T10:24:00Z"
  },
  {
    id: "emergent-2026-01",
    brand: "Emergent",
    contact: "Via Play9",
    email: "",
    value: 6000,
    stage: "evaluating",
    platform: "Multi-plataforma",
    deliverables: "1 Reels com repost nos Stories, TikTok e Shorts YouTube + 1 combo de 3 stories. Sem direitos adicionais.",
    deadline: "2026-01-21",
    notes: "Demanda urgente. Valor: USD 6,000. Pagamento: 14 dias após publicação mediante assinatura do contrato. Prazo apertado (publicação prevista 21/01, veiculação 1 mês). ⚠️ Verificar se já foi confirmado.",
    created_at: "2026-01-29T10:24:00Z",
    updated_at: "2026-01-29T10:24:00Z"
  },
  {
    id: "amazon-dojo-ccxp-2025",
    brand: "Amazon Prime Video (DOJO)",
    contact: "Sofia Garcia (DOJO)",
    email: "sgarcia@dojo.do",
    value: 0,
    stage: "contracted",
    platform: "Conteúdo",
    deliverables: "Criação de conteúdo para campanha CCXP. Contrato de influenciador com interveniente anuente.",
    deadline: "",
    notes: "Contrato enviado em 15/dez/2025 via DOJO. Ilan aprovou mesmo dia, mas Igor (Play9) pediu análise jurídica antes. Thread ativa com Sofia Garcia + Play9 (Igor, Gabi Padilha, Lidiane, pré-faturamento, contratos). Último email 16/jan. ⚠️ Verificar status da assinatura e faturamento. Liberação de faturamento enviada por DOJO em 17/dez.",
    created_at: "2025-12-15T15:34:00Z",
    updated_at: "2026-01-16T11:00:00Z"
  },
  {
    id: "tecfix-academy-2026-01",
    brand: "TecFix Academy",
    contact: "Beatriz (TecFix)",
    email: "techfixacademyy@gmail.com",
    value: 0,
    stage: "inbox",
    platform: "TBD",
    deliverables: "Divulgação institucional TecFix Academy (assistência técnica Apple). Orçamento enviado por Isabella (Play9).",
    deadline: "",
    notes: "Instituição de ensino focada em assistência técnica Apple. Isabella já respondeu em 15/jan com orçamento. Cliente direto. Aguardando retorno da marca.",
    created_at: "2026-01-15T10:53:00Z",
    updated_at: "2026-01-15T22:34:00Z"
  }
];

async function addDeals() {
  // Read existing JSON
  const jsonPath = new URL('../public/deals-data.json', import.meta.url);
  const existing = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  const existingIds = new Set(existing.map(d => d.id));

  for (const deal of newDeals) {
    if (existingIds.has(deal.id)) {
      console.log(`⏭️  ${deal.brand} — já existe`);
      continue;
    }

    // Add to Supabase
    const row = {
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
      lost_reason: null,
      rejected_reason: null,
      created_at: deal.created_at,
      updated_at: deal.updated_at,
    };

    const { error } = await supabase.from('deals').upsert(row);
    if (error) {
      console.error(`❌ ${deal.brand}:`, error.message);
    } else {
      console.log(`✅ ${deal.brand} — adicionado ao Supabase`);
    }

    // Add to JSON
    existing.push({
      ...deal,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
    });
  }

  // Write updated JSON
  writeFileSync(jsonPath, JSON.stringify(existing, null, 2));
  console.log(`\n📁 deals-data.json atualizado (${existing.length} deals total)`);
}

addDeals().catch(console.error);
