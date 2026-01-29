// One-off script to create the deals table via Supabase Management API
// Run: node scripts/create-deals-table.mjs

const SUPABASE_URL = 'https://gsxanzgwstlpfvnqcmiu.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeGFuemd3c3RscGZ2bnFjbWl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY2NjIwMiwiZXhwIjoyMDgzMjQyMjAyfQ.PUdvFWSOBPbs09hQzv0wK_XF-VaeJo5R9qYrMLoGW1g';

const SQL = `
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  contact TEXT DEFAULT '',
  email TEXT DEFAULT '',
  value INTEGER DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'inbox',
  platform TEXT DEFAULT '',
  deliverables TEXT DEFAULT '',
  deadline DATE,
  notes TEXT DEFAULT '',
  lost_reason TEXT,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow service role full access
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Policy: allow all for service role (via API routes)
CREATE POLICY IF NOT EXISTS "Service role full access" ON deals
  FOR ALL
  USING (true)
  WITH CHECK (true);
`;

// Use the Supabase pg-meta endpoint to execute SQL
// This requires creating a temporary function
async function createTable() {
  // Step 1: Create a temporary function that creates the table
  const createFnSQL = `
    CREATE OR REPLACE FUNCTION create_deals_table()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        brand TEXT NOT NULL,
        contact TEXT DEFAULT '',
        email TEXT DEFAULT '',
        value INTEGER DEFAULT 0,
        stage TEXT NOT NULL DEFAULT 'inbox',
        platform TEXT DEFAULT '',
        deliverables TEXT DEFAULT '',
        deadline DATE,
        notes TEXT DEFAULT '',
        lost_reason TEXT,
        rejected_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
      
      -- Drop policy if exists, then create
      DROP POLICY IF EXISTS "Service role full access" ON deals;
      CREATE POLICY "Service role full access" ON deals
        FOR ALL
        USING (true)
        WITH CHECK (true);
    END;
    $$;
  `;

  // Create the function
  const res1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  // Actually, we can't run raw SQL via REST API directly.
  // Let's use a different approach: use supabase-js to create via rpc
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Try calling a function that creates the table
  // First, let's check if we can use the sql editor endpoint
  console.log('Attempting to create deals table...');
  
  // The Supabase dashboard SQL editor uses a different endpoint
  // Let's try the pg-meta API
  const pgMetaRes = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'x-connection-encrypted': 'true',
    },
    body: JSON.stringify({ query: SQL }),
  });
  
  if (pgMetaRes.ok) {
    console.log('✅ Table created successfully via pg-meta!');
    return;
  }
  
  console.log('pg-meta failed:', pgMetaRes.status, await pgMetaRes.text());
  
  // Fallback: try the query endpoint with different path
  const altRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: SQL }),
  });
  
  if (altRes.ok) {
    console.log('✅ Table created via exec_sql!');
    return;
  }
  
  console.log('exec_sql failed:', altRes.status, await altRes.text());
  console.log('\n⚠️  Could not create table automatically.');
  console.log('Please run this SQL in the Supabase Dashboard SQL Editor:');
  console.log('https://supabase.com/dashboard/project/gsxanzgwstlpfvnqcmiu/sql');
  console.log('\n' + SQL);
}

createTable().catch(console.error);
