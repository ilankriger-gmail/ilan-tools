'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    resgates: 0,
    participacoes: 0,
    bugs: 0,
    posts24h: 0,
    users24h: 0,
    hearts24h: 0,
    comments24h: 0,
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      
      setStats({
        resgates: data.resgates || 0,
        participacoes: data.participacoes || 0,
        bugs: data.bugs || 0,
        posts24h: data.posts24h || 0,
        users24h: data.users24h || 0,
        hearts24h: data.hearts24h || 0,
        comments24h: data.comments24h || 0,
      });
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Links do Admin em ordem alfabética
  const adminLinks = [
    { name: '📢 Anúncios', href: '/admin/anuncios' },
    { name: '📊 Analytics', href: '/admin/analytics' },
    { name: '🐛 Bugs', href: '/admin/bugs' },
    { name: '⚙️ Configurações', href: '/admin/configuracoes' },
    { name: '🎯 Desafios', href: '/admin/desafios' },
    { name: '✉️ Emails', href: '/admin/emails' },
    { name: '❤️ Engajamento', href: '/admin/engajamento' },
    { name: '📅 Eventos', href: '/admin/eventos' },
    { name: '📄 Landing Pages', href: '/admin/landing-pages' },
    { name: '📈 Leads NPS', href: '/admin/leads' },
    { name: '🔔 Notificações', href: '/admin/notificacoes' },
    { name: '🏠 Painel', href: '/admin' },
    { name: '📝 Posts', href: '/admin/posts' },
    { name: '🎁 Prêmios', href: '/admin/premios' },
    { name: '💰 Resgates', href: '/admin/resgates' },
    { name: '👥 Usuários', href: '/admin/usuarios' },
  ];

  const externalLinks = [
    { name: '📱 App Store', href: 'https://appstoreconnect.apple.com' },
    { name: '🚪 Portal', href: 'https://portal-omocodoteamo.vercel.app' },
    { name: '📊 Supabase', href: 'https://supabase.com/dashboard/project/gsxanzgwstlpfvnqcmiu' },
    { name: '🚀 Vercel', href: 'https://vercel.com/dashboard' },
    { name: '🌊 ViralWave', href: 'https://viralwave-web.vercel.app' },
    { name: '🎬 YouTube Analyzer', href: 'https://youtube-analyzer.vercel.app' },
  ];

  const BASE = 'https://comunidade.omocodoteamo.com.br';

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Voltar</Link>
          <h1 className="text-4xl font-bold mt-2">☀️ Bom dia, Ilan!</h1>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Alert Banner */}
        {stats.resgates > 0 && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl animate-pulse">
            <p className="text-red-400 font-bold text-lg text-center">
              ⚠️ {stats.resgates} resgate(s) pendente(s)!
            </p>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <a href={`${BASE}/admin/resgates`} target="_blank" rel="noopener noreferrer"
             className={`p-6 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 ${stats.resgates > 0 ? 'ring-4 ring-white/50 animate-pulse' : ''}`}>
            <p className="text-white/80 text-sm">💰 Resgates</p>
            <p className="text-4xl font-bold text-white">{loading ? '...' : stats.resgates}</p>
          </a>
          <a href={`${BASE}/admin/desafios`} target="_blank" rel="noopener noreferrer"
             className={`p-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 ${stats.participacoes > 0 ? 'ring-2 ring-yellow-400' : ''}`}>
            <p className="text-white/80 text-sm">🏆 Participações</p>
            <p className="text-4xl font-bold text-white">{loading ? '...' : stats.participacoes}</p>
          </a>
          <a href={`${BASE}/admin/bugs`} target="_blank" rel="noopener noreferrer"
             className={`p-6 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 ${stats.bugs > 0 ? 'ring-2 ring-orange-400' : ''}`}>
            <p className="text-white/80 text-sm">🐛 Bugs</p>
            <p className="text-4xl font-bold text-white">{loading ? '...' : stats.bugs}</p>
          </a>
          <a href={`${BASE}/admin/posts`} target="_blank" rel="noopener noreferrer"
             className="p-6 rounded-xl bg-gradient-to-br from-green-500 to-teal-500">
            <p className="text-white/80 text-sm">📝 Posts 24h</p>
            <p className="text-4xl font-bold text-white">{loading ? '...' : stats.posts24h}</p>
          </a>
        </div>

        {/* Métricas 24h */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Métricas (Últimas 24h)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{loading ? '-' : stats.users24h}</div>
              <div className="text-gray-400 text-sm">Novos Usuários</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{loading ? '-' : stats.posts24h}</div>
              <div className="text-gray-400 text-sm">Novos Posts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{loading ? '-' : stats.hearts24h}</div>
              <div className="text-gray-400 text-sm">Corações Dados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{loading ? '-' : stats.comments24h}</div>
              <div className="text-gray-400 text-sm">Comentários</div>
            </div>
          </div>
        </div>

        {/* Admin Links */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-4">
          <h2 className="text-xl font-semibold mb-4">🔧 Admin Comunidade</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {adminLinks.map((link) => (
              <a key={link.name} href={`${BASE}${link.href}`} target="_blank" rel="noopener noreferrer"
                 className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-sm text-center">
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* External Links */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🔗 Externos</h2>
          <div className="flex flex-wrap gap-3">
            {externalLinks.map((link) => (
              <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer"
                 className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg transition-all">
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          <button onClick={loadAll} disabled={loading} className="ml-4 text-purple-400 hover:text-purple-300">
            {loading ? '⏳' : '🔄'} Atualizar
          </button>
        </div>
      </div>
    </main>
  );
}
