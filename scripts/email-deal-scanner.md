# Email Deal Scanner - Instruções para Cron

## O que fazer
Varrer os emails das duas contas (ilankriger@gmail.com e ilanaimec@gmail.com) procurando:
1. **Novos deals/propostas** — emails com keywords: orçamento, proposta, parceria, publi, campanha, contrato, collab
2. **Atualizações de deals existentes** — respostas em threads de deals já no tracker
3. **Notas fiscais / repasses** — da Play9 ou outras agências
4. **Liberações de faturamento** — pendentes

## Contas
- `gog gmail messages search "..." --account ilankriger@gmail.com`
- `gog gmail messages search "..." --account ilanaimec@gmail.com`

## Queries úteis
```bash
# Novos deals (últimos 7 dias)
gog gmail messages search "newer_than:7d (orçamento OR proposta OR parceria OR publi OR campanha)" --max 20 --account ilankriger@gmail.com --json

# Contratos/faturamento
gog gmail messages search "newer_than:7d (contrato OR faturamento OR repasse OR nota fiscal)" --max 20 --account ilankriger@gmail.com --json
```

## Tracker
- **JSON:** ~/clawd/ilan-tools/public/deals-data.json
- **Supabase:** tabela `deals` (upsert com service role key)
- **Script modelo:** ~/clawd/ilan-tools/scripts/add-new-deals.mjs

## Regras
- Comparar com deals existentes antes de criar novos
- Atualizar stage se houver mudança (ex: inbox → evaluating → negotiating → contracted)
- Notificar Ilan no Telegram se encontrar deal novo relevante (ignorar spam/baixo valor)
- Registrar scan em memory/YYYY-MM-DD.md
