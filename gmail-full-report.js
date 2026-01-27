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

async function gmailRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'gmail.googleapis.com',
      path: path,
      method: method,
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    };
    if (body) options.headers['Content-Type'] = 'application/json';
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function searchEmails(query, maxResults = 1000) {
  let allMessages = [];
  let pageToken = null;
  
  do {
    const encodedQuery = encodeURIComponent(query);
    let url = `/gmail/v1/users/me/messages?q=${encodedQuery}&maxResults=100`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    
    const result = await gmailRequest(url);
    if (result.messages) allMessages = allMessages.concat(result.messages);
    pageToken = result.nextPageToken;
    console.log(`Buscando... ${allMessages.length} emails encontrados`);
  } while (pageToken && allMessages.length < maxResults);
  
  return allMessages;
}

async function getMessage(id) {
  return await gmailRequest(`/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`);
}

async function archiveMessage(id) {
  return await gmailRequest(`/gmail/v1/users/me/messages/${id}/modify`, 'POST', {
    removeLabelIds: ['INBOX']
  });
}

function categorize(subject, from) {
  const subjectLower = (subject || '').toLowerCase();
  const fromLower = (from || '').toLowerCase();
  
  // Skip system emails
  if (fromLower.includes('noreply') || fromLower.includes('no-reply') || 
      fromLower.includes('facebook') || fromLower.includes('google.com') ||
      fromLower.includes('metamail') || fromLower.includes('facebookmail')) {
    return 'system';
  }
  
  // Help requests
  const helpKeywords = ['ajuda', 'socorro', 'pedido de ajuda', 'me ajuda', 'cirurgia', 
    'doença', 'tratamento médico', 'urgente ajuda', 'preciso de ajuda', 'imploro',
    'vaquinha', 'vakinha', 'doação'];
  
  for (const kw of helpKeywords) {
    if (subjectLower.includes(kw)) {
      // Make sure it's not commercial
      if (!subjectLower.includes('orçamento') && !subjectLower.includes('proposta') && 
          !subjectLower.includes('campanha') && !subjectLower.includes('parceria paga')) {
        return 'help';
      }
    }
  }
  
  // Commercial
  const commercialKeywords = ['orçamento', 'proposta', 'parceria', 'campanha', 'projeto', 
    'publi', 'contrato', 'briefing', 'marca', 'patrocínio', 'consulta comercial', 'mídia kit'];
  
  for (const kw of commercialKeywords) {
    if (subjectLower.includes(kw)) return 'commercial';
  }
  
  // Commercial domains
  const commercialDomains = ['play9', 'squid', 'mestica', 'publination', 'zenogroup', 
    'onixx', '1043.ag', 'inflr', 'ampfy', 'deck.marketing', 'jeffreygroup', 'growmaxvalue'];
  for (const domain of commercialDomains) {
    if (fromLower.includes(domain)) return 'commercial';
  }
  
  // Spam
  const spamKeywords = ['bet', 'casino', 'apostas', 'ganhe dinheiro', 'bitcoin', 'crypto'];
  for (const kw of spamKeywords) {
    if (subjectLower.includes(kw) || fromLower.includes(kw)) return 'spam';
  }
  
  return 'other';
}

async function main() {
  console.log('🔄 Refreshing token...\n');
  await refreshToken();
  
  // Search ALL emails from 2025
  const query = 'after:2025/01/01';
  console.log(`📧 Buscando todos os emails desde 01/01/2025...\n`);
  
  const messages = await searchEmails(query, 1000);
  console.log(`\n📊 Total encontrado: ${messages.length} emails\n`);
  console.log('Processando e categorizando...\n');
  
  const categories = { commercial: [], help: [], spam: [], system: [], other: [] };
  let processed = 0;
  
  for (const msg of messages) {
    const details = await getMessage(msg.id);
    processed++;
    if (processed % 100 === 0) console.log(`Processando ${processed}/${messages.length}...`);
    
    if (details.payload && details.payload.headers) {
      const headers = details.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '(sem assunto)';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const dateStr = headers.find(h => h.name === 'Date')?.value || '';
      
      const category = categorize(subject, from);
      const date = new Date(dateStr);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
      const senderName = nameMatch ? nameMatch[1].trim() : from.split('@')[0];
      
      categories[category].push({
        id: msg.id,
        date,
        month,
        subject,
        senderName,
        from
      });
    }
  }
  
  // Sort each category by date
  for (const cat of Object.keys(categories)) {
    categories[cat].sort((a, b) => b.date - a.date);
  }
  
  // Output report
  console.log('\n' + '='.repeat(70));
  console.log('📊 RELATÓRIO COMPLETO - ILANAIMEC@GMAIL.COM');
  console.log('📅 Período: Janeiro 2025 - Janeiro 2026');
  console.log('='.repeat(70) + '\n');
  
  console.log('📈 RESUMO POR CATEGORIA:\n');
  console.log(`   🏢 Propostas Comerciais: ${categories.commercial.length}`);
  console.log(`   🙏 Pedidos de Ajuda: ${categories.help.length}`);
  console.log(`   🚫 Spam: ${categories.spam.length}`);
  console.log(`   ⚙️ Sistema (notificações): ${categories.system.length}`);
  console.log(`   📬 Outros: ${categories.other.length}`);
  console.log(`   ─────────────────────────`);
  console.log(`   📧 TOTAL: ${messages.length}\n`);
  
  // Commercial details
  console.log('\n' + '='.repeat(70));
  console.log('🏢 PROPOSTAS COMERCIAIS (detalhado)');
  console.log('='.repeat(70) + '\n');
  
  const commercialByMonth = {};
  for (const e of categories.commercial) {
    if (!commercialByMonth[e.month]) commercialByMonth[e.month] = [];
    commercialByMonth[e.month].push(e);
  }
  
  for (const month of Object.keys(commercialByMonth).sort().reverse()) {
    const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    console.log(`\n📅 ${monthName.toUpperCase()} (${commercialByMonth[month].length})`);
    console.log('-'.repeat(50));
    
    const seen = new Set();
    for (const e of commercialByMonth[month]) {
      const key = e.subject.substring(0, 40);
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`• ${e.subject.substring(0, 60)}`);
      console.log(`  De: ${e.senderName}`);
    }
  }
  
  // Help requests
  console.log('\n\n' + '='.repeat(70));
  console.log('🙏 PEDIDOS DE AJUDA (resumo)');
  console.log('='.repeat(70) + '\n');
  
  for (const e of categories.help.slice(0, 30)) {
    const dateStr = e.date.toLocaleDateString('pt-BR');
    console.log(`[${dateStr}] ${e.senderName} - ${e.subject.substring(0, 50)}`);
  }
  if (categories.help.length > 30) {
    console.log(`\n... e mais ${categories.help.length - 30} pedidos`);
  }
  
  // Archive help requests and spam
  console.log('\n\n🗂️ ARQUIVANDO pedidos de ajuda e spam...\n');
  
  const toArchive = [...categories.help, ...categories.spam];
  let archived = 0;
  
  for (const e of toArchive) {
    try {
      await archiveMessage(e.id);
      archived++;
      if (archived % 20 === 0) console.log(`Arquivados: ${archived}/${toArchive.length}`);
    } catch (err) {
      // ignore
    }
  }
  
  console.log(`\n✅ ${archived} emails arquivados (${categories.help.length} ajuda + ${categories.spam.length} spam)`);
  
  // Save report
  const report = {
    generatedAt: new Date().toISOString(),
    period: '2025-01 a 2026-01',
    totals: {
      commercial: categories.commercial.length,
      help: categories.help.length,
      spam: categories.spam.length,
      system: categories.system.length,
      other: categories.other.length,
      total: messages.length
    },
    commercial: categories.commercial.map(e => ({
      date: e.date.toISOString().split('T')[0],
      subject: e.subject,
      from: e.senderName
    })),
    help: categories.help.map(e => ({
      date: e.date.toISOString().split('T')[0],
      subject: e.subject,
      from: e.senderName
    }))
  };
  
  fs.writeFileSync('/Users/macmini/clawd/ilan-tools/relatorio-completo-2025.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Relatório salvo em: relatorio-completo-2025.json');
}

main().catch(console.error);
