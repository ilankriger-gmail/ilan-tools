---
title: "ViralWave - Arquitetura técnica"
date: "2026-01-28"
type: project
tags: ["viralwave", "arquitetura", "técnico"]
summary: "Documentação da arquitetura do ViralWave v4"
---

# ViralWave - Arquitetura técnica

## Visão geral

O ViralWave é uma plataforma de automação de social media que permite criar campanhas multi-plataforma com IA.

## Fluxo principal

```
Upload CSV → Parse → IA gera variações → Agendamento → Cron publica → Analytics
```

## Plataformas suportadas

| Plataforma | API | Status |
|-----------|-----|--------|
| Twitter | X API v2 | ✅ Ativo |
| Facebook | Graph API | ✅ Ativo |
| Threads | Threads API | ✅ Ativo |
| Instagram | Graph API | 🔄 Planejado |
| LinkedIn | Marketing API | 🔄 Planejado |

## Stack
- **App**: Next.js (Vercel)
- **DB**: Supabase PostgreSQL
- **IA**: GPT-4o, Claude, Gemini
- **Cron**: Vercel Cron (1 min interval)
- **Storage**: Supabase Storage

## Endpoints principais
- `POST /api/campaigns` - Criar campanha
- `POST /api/campaigns/:id/schedule` - Agendar
- `GET /api/campaigns/:id/analytics` - Métricas
- `POST /api/cron/publish` - Publicar agendados
