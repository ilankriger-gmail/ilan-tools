const https = require('https');
const fs = require('fs');

const tokens = JSON.parse(fs.readFileSync('/Users/macmini/clawd/credentials/gmail-tokens.json'));
const oauth = JSON.parse(fs.readFileSync('/Users/macmini/clawd/credentials/gmail-oauth.json'));

async function refreshToken() {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: oauth.installed.client_id,
      client_secret: oauth.installed.client_secret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token'
    }).toString();

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': postData.length }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.access_token) {
          tokens.access_token = result.access_token;
          fs.writeFileSync('/Users/macmini/clawd/credentials/gmail-tokens.json', JSON.stringify(tokens, null, 2));
          resolve(result.access_token);
        } else reject(result);
      });
    });
    req.write(postData);
    req.end();
  });
}

async function gmailRequest(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'gmail.googleapis.com',
      path: path,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function searchEmails(query, maxResults = 500) {
  let allMessages = [];
  let pageToken = null;
  
  do {
    const encodedQuery = encodeURIComponent(query);
    let url = `/gmail/v1/users/me/messages?q=${encodedQuery}&maxResults=100`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    
    const result = await gmailRequest(url);
    if (result.messages) allMessages = allMessages.concat(result.messages);
    pageToken = result.nextPageToken;
  } while (pageToken && allMessages.length < maxResults);
  
  return allMessages;
}

async function getMessage(id) {
  return await gmailRequest(`/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`);
}

// Filter out non-commercial emails
function isCommercial(subject, from) {
  const subjectLower = (subject || '').toLowerCase();
  const fromLower = (from || '').toLowerCase();
  
  // Skip personal requests
  const skipKeywords = ['ajuda', 'socorro', 'cirurgia', 'doença', 'tratamento', 'gato', 'cachorro', 'pet', 
    'noreply', 'facebook', 'meta for business', 'google', 'security@', 'bet', 'casino', 'apostas'];
  
  for (const kw of skipKeywords) {
    if (subjectLower.includes(kw) || fromLower.includes(kw)) return false;
  }
  
  // Include commercial keywords
  const commercialKeywords = ['orçamento', 'proposta', 'parceria', 'campanha', 'projeto', 'publi', 
    'contrato', 'negociação', 'briefing', 'marca', 'patrocínio', 'consulta'];
  
  for (const kw of commercialKeywords) {
    if (subjectLower.includes(kw)) return true;
  }
  
  // Include if from agency domains
  const agencyDomains = ['play9', 'squid', 'mestica', 'publination', 'zenogroup', 'onixx', '1043.ag'];
  for (const domain of agencyDomains) {
    if (fromLower.includes(domain)) return true;
  }
  
  return false;
}

async function main() {
  console.log('Refreshing token...');
  await refreshToken();
  
  // Search broader
  const query = 'after:2025/01/01 -category:promotions -category:social';
  console.log(`Searching all emails since 2025...\n`);
  
  const messages = await searchEmails(query, 500);
  console.log(`Found ${messages.length} total messages, filtering commercial...\n`);
  
  // Get details and filter
  const emails = [];
  let processed = 0;
  
  for (const msg of messages) {
    const details = await getMessage(msg.id);
    processed++;
    if (processed % 50 === 0) console.log(`Processing ${processed}/${messages.length}...`);
    
    if (details.payload && details.payload.headers) {
      const headers = details.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const dateStr = headers.find(h => h.name === 'Date')?.value || '';
      
      if (isCommercial(subject, from)) {
        const date = new Date(dateStr);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Extract sender name and company
        const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
        const emailMatch = from.match(/<([^>]+)>/);
        const senderName = nameMatch ? nameMatch[1].trim() : from;
        const senderEmail = emailMatch ? emailMatch[1] : from;
        const company = senderEmail.split('@')[1]?.replace('.com.br', '').replace('.com', '') || '';
        
        emails.push({ date, month, subject, senderName, senderEmail, company, id: msg.id });
      }
    }
  }
  
  // Sort by date
  emails.sort((a, b) => a.date - b.date);
  
  // Group by month
  const byMonth = {};
  for (const e of emails) {
    if (!byMonth[e.month]) byMonth[e.month] = [];
    byMonth[e.month].push(e);
  }
  
  // Output report
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE ORÇAMENTOS E PROPOSTAS COMERCIAIS');
  console.log('📅 Período: Janeiro 2025 - Janeiro 2026');
  console.log('='.repeat(60) + '\n');
  
  let totalEmails = 0;
  const uniqueCompanies = new Set();
  
  for (const month of Object.keys(byMonth).sort()) {
    const monthEmails = byMonth[month];
    const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    console.log(`\n📅 ${monthName.toUpperCase()} (${monthEmails.length} emails)`);
    console.log('-'.repeat(50));
    
    // Dedupe by subject (keep first)
    const seen = new Set();
    for (const e of monthEmails) {
      const key = e.subject.substring(0, 50);
      if (seen.has(key)) continue;
      seen.add(key);
      
      console.log(`• ${e.subject.substring(0, 60)}`);
      console.log(`  De: ${e.senderName} (${e.company})`);
      uniqueCompanies.add(e.company);
      totalEmails++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 RESUMO');
  console.log('='.repeat(60));
  console.log(`Total de propostas/orçamentos: ${totalEmails}`);
  console.log(`Empresas/Agências únicas: ${uniqueCompanies.size}`);
  console.log(`\nEmpresas: ${[...uniqueCompanies].join(', ')}`);
}

main().catch(console.error);
