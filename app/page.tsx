'use client';

import Link from 'next/link';

const tools: { name: string; description: string; href: string; color: string; external?: boolean; soon?: boolean; category?: string }[] = [
  // --- Principais ---
  {
    name: '📊 Creator Dashboard',
    description: 'Analytics unificado: YouTube, Instagram, TikTok, Twitter',
    href: 'https://creator-dashboard-beta.vercel.app',
    external: true,
    color: 'from-violet-500 to-purple-500',
    category: 'principal',
  },
  {
    name: '🌊 ViralWave',
    description: 'Campanhas multi-plataforma: Twitter, Facebook, Threads',
    href: 'https://viralwave-web.vercel.app',
    external: true,
    color: 'from-blue-500 to-cyan-500',
    category: 'principal',
  },
  {
    name: '❤️ Comunidade',
    description: 'Arena Te Amo - Admin',
    href: 'https://comunidade.omocodoteamo.com.br/admin',
    external: true,
    color: 'from-pink-500 to-red-500',
    category: 'principal',
  },
  {
    name: '🚪 Portal',
    description: 'Portal O Moço do Te Amo',
    href: 'https://portal-omocodoteamo.vercel.app',
    external: true,
    color: 'from-green-500 to-teal-500',
    category: 'principal',
  },
  {
    name: '🔥 Viral Finder',
    description: 'Detectar outliers, trends e conteúdo viral',
    href: 'https://viral-finder-eight.vercel.app',
    external: true,
    color: 'from-amber-500 to-red-500',
    category: 'principal',
  },
  // --- Ferramentas ---
  {
    name: '🌅 Dashboard Matinal',
    description: 'Tudo que precisa de atenção num só lugar',
    href: '/dashboard',
    color: 'from-orange-500 to-pink-500',
    category: 'ferramenta',
  },
  {
    name: '🎬 YouTube Analyzer',
    description: 'Analisar vídeos e canais do YouTube',
    href: 'https://youtube-analyzer-eosin.vercel.app',
    external: true,
    color: 'from-red-500 to-orange-500',
    category: 'ferramenta',
  },
  {
    name: '🔗 UTM Generator',
    description: 'Links com tracking para campanhas',
    href: '/utm',
    color: 'from-orange-500 to-yellow-500',
    category: 'ferramenta',
  },
  {
    name: '🧠 Second Brain',
    description: '769 notas organizadas do Apple Notes',
    href: 'https://second-brain-app-five.vercel.app',
    external: true,
    color: 'from-purple-500 to-indigo-500',
    category: 'ferramenta',
  },
  {
    name: '💼 Deal Tracker',
    description: 'Pipeline de propostas comerciais e parcerias',
    href: '/deals',
    color: 'from-emerald-500 to-teal-500',
    category: 'ferramenta',
  },
  {
    name: '📜 Teleprompter',
    description: 'Roteiros com scroll automático, espelho e timer',
    href: 'https://2026-02-01-teleprompter.vercel.app',
    external: true,
    color: 'from-sky-500 to-blue-500',
    category: 'ferramenta',
  },
  // --- Consoles de Developer ---
  {
    name: '📘 Meta Developer',
    description: 'Apps Facebook/Instagram — Creator Dashboard',
    href: 'https://developers.facebook.com/apps/2420111758421057/',
    external: true,
    color: 'from-blue-600 to-blue-400',
    category: 'console',
  },
  {
    name: '🎵 TikTok Developer',
    description: 'App TikTok — Creator Dashboard',
    href: 'https://developers.tiktok.com/apps/',
    external: true,
    color: 'from-gray-800 to-gray-600',
    category: 'console',
  },
  {
    name: '🐦 X/Twitter Console',
    description: 'API Keys e configurações do Twitter',
    href: 'https://console.x.com',
    external: true,
    color: 'from-gray-700 to-gray-500',
    category: 'console',
  },
  // --- Infraestrutura ---
  {
    name: '🗄️ Supabase',
    description: 'Banco de dados e autenticação',
    href: 'https://supabase.com/dashboard',
    external: true,
    color: 'from-emerald-600 to-green-400',
    category: 'infra',
  },
  {
    name: '▲ Vercel',
    description: 'Deploys e hosting de todos os projetos',
    href: 'https://vercel.com/dashboard',
    external: true,
    color: 'from-gray-900 to-gray-700',
    category: 'infra',
  },
  {
    name: '🐙 GitHub',
    description: 'Repositórios e código-fonte',
    href: 'https://github.com/ilankriger-gmail',
    external: true,
    color: 'from-gray-800 to-purple-600',
    category: 'infra',
  },
];

const categories = [
  { key: 'principal', label: '🚀 Principais' },
  { key: 'ferramenta', label: '🔧 Ferramentas' },
  { key: 'console', label: '👨‍💻 Developer Consoles' },
  { key: 'infra', label: '⚙️ Infraestrutura' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🛠️ Ferramentas do Ilan
          </h1>
          <p className="text-xl text-gray-300">
            Tudo num só lugar. Sem perder nada.
          </p>
        </div>

        {categories.map((cat) => {
          const catTools = tools.filter((t) => t.category === cat.key);
          if (catTools.length === 0) return null;
          return (
            <div key={cat.key} className="mb-10">
              <h2 className="text-2xl font-bold text-white/70 mb-4">{cat.label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catTools.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    target={tool.external ? '_blank' : undefined}
                    className={`relative block p-5 rounded-2xl bg-gradient-to-br ${tool.color} transform hover:scale-105 transition-all duration-200 shadow-xl ${tool.soon ? 'opacity-60' : ''}`}
                  >
                    {tool.soon && (
                      <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        Em breve
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white mb-1">{tool.name}</h3>
                    <p className="text-white/80 text-sm">{tool.description}</p>
                    {tool.external && (
                      <span className="absolute bottom-2 right-2 text-white/50 text-xs">↗️</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-12 text-center text-gray-500 text-sm">
          Feito com ❤️ pelo Theo
        </div>
      </div>
    </main>
  );
}
