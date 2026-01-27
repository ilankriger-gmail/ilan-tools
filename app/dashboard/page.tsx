'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SUPABASE_URL = 'https://gsxanzgwstlpfvnqcmiu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeGFuemd3c3RscGZ2bnFjbWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NjYyMDIsImV4cCI6MjA4MzI0MjIwMn0.OapNhZJbbeH0eEJWIU_zg4ihEvtxSC9rAG-dLBQCmvE';

interface Stats {
  pendingClaims: number;
  pendingParticipations: number;
  pendingBugs: number;
  todayPosts: number;
  totalUsers: number;
  loading: boolean;
  error: string | null;
}

async function fetchSupabase(table: string, query: string = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  return res.json();
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    pendingClaims: 0,
    pendingParticipations: 0,
    pendingBugs: 0,
    todayPosts: 0,
    totalUsers: 0,
    loading: true,
    error: null,
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = async () => {
    try {
      setStats(s => ({ ...s, loading: true }));
      
      // Fetch all data in parallel
      const [claims, participations, bugs, users] = await Promise.all([
        fetchSupabase('reward_claims', 'status=eq.pending&select=id'),
        fetchSupabase('challenge_participants', 'status=eq.pending&select=id'),
        fetchSupabase('bug_reports', 'status=eq.open&select=id'),
        fetchSupabase('profiles', 'select=id'),
      ]);

      setStats({
        pendingClaims: Array.isArray(claims) ? claims.length : 0,
        pendingParticipations: Array.isArray(participations) ? participations.length : 0,
        pendingBugs: Array.isArray(bugs) ? bugs.length : 0,
        todayPosts: 0, // Would need date filter
        totalUsers: Array.isArray(users) ? users.length : 0,
        loading: false,
        error: null,
      });
      setLastUpdate(new Date());
    } catch (err) {
      setStats(s => ({ ...s, loading: false, error: 'Erro ao carregar dados' }));
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000); // 5 min
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: '💰 Resgates Pendentes',
      value: stats.pendingClaims,
      href: 'https://comunidade.omocodoteamo.com.br/admin/resgates',
      alert: stats.pendingClaims > 0,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: '🏆 Desafios p/ Aprovar',
      value: stats.pendingParticipations,
      href: 'https://comunidade.omocodoteamo.com.br/admin/desafios',
      alert: stats.pendingParticipations > 0,
      color: 'from-blue-500 to-purple-500',
    },
    {
      title: '🐛 Bugs Abertos',
      value: stats.pendingBugs,
      href: 'https://comunidade.omocodoteamo.com.br/admin/bugs',
      alert: stats.pendingBugs > 0,
      color: 'from-red-500 to-pink-500',
    },
    {
      title: '👥 Total Usuários',
      value: stats.totalUsers,
      href: 'https://comunidade.omocodoteamo.com.br/admin/usuarios',
      alert: false,
      color: 'from-green-500 to-teal-500',
    },
  ];

  const quickLinks = [
    { name: '🏠 Admin', href: 'https://comunidade.omocodoteamo.com.br/admin' },
    { name: '🌊 ViralWave', href: 'https://viralwave-web.vercel.app' },
    { name: '📊 Supabase', href: 'https://supabase.com/dashboard/project/gsxanzgwstlpfvnqcmiu' },
    { name: '🚀 Vercel', href: 'https://vercel.com/dashboard' },
    { name: '📱 App Store', href: 'https://appstoreconnect.apple.com' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-gray-400 hover:text-white text-sm mb-2 block">
              ← Voltar
            </Link>
            <h1 className="text-4xl font-bold text-white">🌅 Dashboard Matinal</h1>
            <p className="text-gray-400 mt-1">
              Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={stats.loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            {stats.loading ? '⏳' : '🔄'} Atualizar
          </button>
        </div>

        {/* Alert Banner */}
        {stats.pendingClaims > 0 && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl animate-pulse">
            <p className="text-red-400 font-bold text-lg">
              ⚠️ {stats.pendingClaims} resgate(s) aguardando aprovação!
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${card.color} transform hover:scale-105 transition-all duration-200 ${card.alert ? 'ring-4 ring-white/50 animate-pulse' : ''}`}
            >
              <p className="text-white/80 text-sm mb-1">{card.title}</p>
              <p className="text-4xl font-bold text-white">
                {stats.loading ? '...' : card.value}
              </p>
            </a>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🔗 Acesso Rápido</h2>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Atualiza automaticamente a cada 5 minutos • Feito com ❤️ pelo Theo
        </div>
      </div>
    </main>
  );
}
