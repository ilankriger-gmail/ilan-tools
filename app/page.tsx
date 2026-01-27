'use client';

import Link from 'next/link';

const tools = [
  {
    name: '🌅 Dashboard Matinal',
    description: 'Tudo que precisa de atenção num só lugar',
    href: '/dashboard',
    color: 'from-orange-500 to-pink-500',
  },
  {
    name: '🧠 Second Brain',
    description: 'Seu banco de conhecimento organizado',
    href: '/brain',
    color: 'from-purple-500 to-indigo-500',
    soon: true,
  },
  {
    name: '🌊 ViralWave',
    description: 'Gerenciar campanhas de tweets',
    href: 'https://viralwave-web.vercel.app',
    external: true,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: '❤️ Comunidade',
    description: 'Arena Te Amo - Admin',
    href: 'https://comunidade.omocodoteamo.com.br/admin',
    external: true,
    color: 'from-pink-500 to-red-500',
  },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              target={tool.external ? '_blank' : undefined}
              className={`relative block p-6 rounded-2xl bg-gradient-to-br ${tool.color} transform hover:scale-105 transition-all duration-200 shadow-xl ${tool.soon ? 'opacity-60' : ''}`}
            >
              {tool.soon && (
                <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  Em breve
                </span>
              )}
              <h2 className="text-2xl font-bold text-white mb-2">{tool.name}</h2>
              <p className="text-white/80">{tool.description}</p>
              {tool.external && (
                <span className="absolute bottom-2 right-2 text-white/50 text-sm">
                  ↗️ Externo
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          Feito com ❤️ pelo Theo
        </div>
      </div>
    </main>
  );
}
