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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.access_token) {
          tokens.access_token = result.access_token;
          fs.writeFileSync('/Users/macmini/clawd/credentials/gmail-tokens.json', JSON.stringify(tokens, null, 2));
          resolve(result.access_token);
        } else {
          reject(result);
        }
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
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function searchEmails(query, maxResults = 100) {
  const encodedQuery = encodeURIComponent(query);
  const result = await gmailRequest(`/gmail/v1/users/me/messages?q=${encodedQuery}&maxResults=${maxResults}`);
  return result;
}

async function getMessage(id) {
  const result = await gmailRequest(`/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`);
  return result;
}

async function main() {
  // Refresh token first
  console.log('Refreshing token...');
  await refreshToken();
  
  // Search for emails from last year with keywords
  const query = 'after:2025/01/01 (orçamento OR proposta OR mentoria OR pedido OR interesse)';
  console.log(`\nSearching: ${query}\n`);
  
  const searchResult = await searchEmails(query, 200);
  
  if (searchResult.error) {
    console.error('Error:', searchResult.error);
    return;
  }
  
  if (!searchResult.messages || searchResult.messages.length === 0) {
    console.log('No messages found');
    return;
  }
  
  console.log(`Found ${searchResult.messages.length} messages\n`);
  
  // Get details of each message
  const emails = [];
  for (const msg of searchResult.messages.slice(0, 50)) { // Limit to 50 for now
    const details = await getMessage(msg.id);
    if (details.payload && details.payload.headers) {
      const headers = details.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '(sem assunto)';
      const from = headers.find(h => h.name === 'From')?.value || '(desconhecido)';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      emails.push({ date, from, subject, id: msg.id });
    }
  }
  
  // Output
  console.log('=== EMAILS ENCONTRADOS ===\n');
  emails.forEach((e, i) => {
    console.log(`${i+1}. ${e.date}`);
    console.log(`   De: ${e.from}`);
    console.log(`   Assunto: ${e.subject}`);
    console.log('');
  });
}

main().catch(console.error);
