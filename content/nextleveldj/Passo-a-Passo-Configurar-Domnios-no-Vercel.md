# Passo a Passo: Configurar Domínios no Vercel

<div><br></div>
<div>  Passo a Passo: Configurar Domínios no Vercel</div>
<div><br></div>
<div>  1. Adicionar Domínios no Vercel</div>
<div><br></div>
<div>  1. Acesse https://vercel.com/dashboard</div>
<div>  2. Clique no projeto advocate-platform</div>
<div>  3. Vá em Settings → Domains</div>
<div>  4. Adicione os domínios:</div>
<div>    - comunidade.omocodoteamo.com.br (principal)</div>
<div>    - comece.omocodoteamo.com.br (landing page)</div>
<div><br></div>
<div>  2. Configurar DNS no Registro.br (ou seu provedor)</div>
<div><br></div>
<div>  No painel do seu domínio, adicione estes registros CNAME:</div>
<div><br></div>
<div>  | Tipo  | Nome       | Valor                |</div>
<div>  |-------|------------|----------------------|</div>
<div>  | CNAME | comunidade | cname.vercel-dns.com |</div>
<div>  | CNAME | comece     | cname.vercel-dns.com |</div>
<div><br></div>
<div>  Se estiver usando Cloudflare/outro provedor, os registros são os mesmos.</div>
<div><br></div>
<div>  3. Configurar Variáveis de Ambiente no Vercel</div>
<div><br></div>
<div>  1. No Vercel, vá em Settings → Environment Variables</div>
<div>  2. Adicione estas variáveis (copie do seu .env.local):</div>
<div><br></div>
<div>  NEXT_PUBLIC_SUPABASE_URL=https://gsxanzgwstlpfvnqcmiu.supabase.co</div>
<div>  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
<div>  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
<div>  NEXT_PUBLIC_SITE_URL=https://comunidade.omocodoteamo.com.br</div>
<div><br></div>
<div>  4. Configurar Redirect para Landing Page</div>
<div><br></div>
<div>  Para comece.omocodoteamo.com.br ir para /seja-nextlover, adicione no vercel.json:</div>
<div><br></div>
<div>  {</div>
<div>    &quotredirects&quot: [</div>
<div>      {</div>
<div>        &quotsource&quot: &quot/&quot,</div>
<div>        &quotdestination&quot: &quot/seja-nextlover&quot,</div>
<div>        &quotpermanent&quot: true,</div>
<div>        &quothas&quot: [</div>
<div>          {</div>
<div>            &quottype&quot: &quothost&quot,</div>
<div>            &quotvalue&quot: &quotcomece.omocodoteamo.com.br&quot</div>
<div>          }</div>
<div>        ]</div>
<div>      }</div>
<div>    ]</div>
<div>  }</div>
<div><br></div>
<div>  5. Atualizar URL de Callback do Google OAuth</div>
<div><br></div>
<div>  1. Acesse https://console.cloud.google.com</div>
<div>  2. Vá em APIs &amp Services → Credentials</div>
<div>  3. Edite o OAuth Client</div>
<div>  4. Adicione em Authorized redirect URIs:</div>
<div>    - https://comunidade.omocodoteamo.com.br/auth/callback</div>
<div><br></div>
<div>  6. Atualizar URL no Supabase</div>
<div><br></div>
<div>  1. Acesse https://supabase.com/dashboard</div>
<div>  2. Vá no seu projeto → Authentication → URL Configuration</div>
<div>  3. Atualize:</div>
<div>    - Site URL: https://comunidade.omocodoteamo.com.br</div>
<div>    - Redirect URLs: adicione https://comunidade.omocodoteamo.com.br/**</div>
<div><br></div>
<div>  ---</div>
<div>  Quer que eu crie o arquivo vercel.json com o redirect?</div>
<div><br></div>
<div><font face="HelveticaNeue">───────────────────────────────────────────────────────</font></div>

