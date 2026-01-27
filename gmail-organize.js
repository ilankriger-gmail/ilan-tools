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
    
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    
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

async function searchEmails(query, maxResults = 200) {
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

async function archiveMessage(id) {
  // Remove from INBOX (archive)
  return await gmailRequest(`/gmail/v1/users/me/messages/${id}/modify`, 'POST', {
    removeLabelIds: ['INBOX']
  });
}

function isHelpRequest(subject, from) {
  const subjectLower = (subject || '').toLowerCase();
  
  const helpKeywords = ['ajuda', 'socorro', 'pedido', 'cirurgia', 'doença', 'tratamento', 
    'operação', 'hospital', 'médico', 'saúde', 'urgente ajuda', 'preciso de ajuda',
    'gato', 'cachorro', 'pet', 'animal', 'dívida', 'desemprego', 'aluguel'];
  
  for (const kw of helpKeywords) {
    if (subjectLower.includes(kw)) {
      // Make sure it's not a commercial request
      const commercialKeywords = ['orçamento', 'campanha', 'marca', 'proposta comercial', 'parceria paga'];
      let isCommercial = false;
      for (const ck of commercialKeywords) {
        if (subjectLower.includes(ck)) isCommercial = true;
      }
      if (!isCommercial) return true;
    }
  }
  
  return false;
}

async function main() {
  console.log('Refreshing token...');
  await refreshToken();
  
  // Search for help requests
  const query = 'after:2025/01/01 in:inbox (ajuda OR socorro OR pedido OR cirurgia OR doença OR tratamento OR gato OR cachorro)';
  console.log(`Searching for help requests...\n`);
  
  const messages = await searchEmails(query, 200);
  console.log(`Found ${messages.length} potential help request emails\n`);
  
  const helpRequests = [];
  let processed = 0;
  
  for (const msg of messages) {
    const details = await getMessage(msg.id);
    processed++;
    
    if (details.payload && details.payload.headers) {
      const headers = details.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const dateStr = headers.find(h => h.name === 'Date')?.value || '';
      
      if (isHelpRequest(subject, from)) {
        const date = new Date(dateStr);
        const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
        const senderName = nameMatch ? nameMatch[1].trim() : from.split('@')[0];
        
        helpRequests.push({ 
          id: msg.id,
          date, 
          subject, 
          senderName,
          from
        });
      }
    }
  }
  
  // Sort by date
  helpRequests.sort((a, b) => b.date - a.date);
  
  console.log('='.repeat(60));
  console.log('📋 PEDIDOS DE AJUDA ENCONTRADOS');
  console.log('='.repeat(60) + '\n');
  
  for (let i = 0; i < helpRequests.length; i++) {
    const r = helpRequests[i];
    const dateStr = r.date.toLocaleDateString('pt-BR');
    console.log(`${i+1}. [${dateStr}] ${r.senderName}`);
    console.log(`   ${r.subject}`);
    console.log('');
  }
  
  console.log(`\nTotal: ${helpRequests.length} pedidos de ajuda\n`);
  
  // Archive them
  console.log('Arquivando pedidos de ajuda...\n');
  let archived = 0;
  
  for (const r of helpRequests) {
    try {
      await archiveMessage(r.id);
      archived++;
      if (archived % 10 === 0) console.log(`Arquivados: ${archived}/${helpRequests.length}`);
    } catch (e) {
      console.log(`Erro ao arquivar: ${r.subject}`);
    }
  }
  
  console.log(`\n✅ ${archived} emails arquivados com sucesso!`);
}

main().catch(console.error);
