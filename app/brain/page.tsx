'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FolderStats {
  name: string;
  count: number;
  emoji: string;
}

export default function BrainPage() {
  const [folders, setFolders] = useState<FolderStats[]>([
    { name: 'nextleveldj', count: 285, emoji: '🎬' },
    { name: 'projetos', count: 41, emoji: '🎯' },
    { name: 'conteudo/formatos', count: 8, emoji: '📋' },
    { name: 'ai', count: 22, emoji: '🤖' },
    { name: 'infoproduto', count: 45, emoji: '📦' },
    { name: 'posts-antigos', count: 107, emoji: '📝' },
    { name: 'videos-antigos', count: 43, emoji: '🎥' },
    { name: 'produtividade', count: 8, emoji: '⚡' },
    { name: 'casa', count: 20, emoji: '🏠' },
    { name: 'desafios', count: 18, emoji: '🏆' },
    { name: 'sorteios', count: 6, emoji: '🎰' },
    { name: 'crescimento', count: 4, emoji: '📈' },
    { name: 'propostas', count: 3, emoji: '💼' },
  ]);

  const totalNotes = folders.reduce((sum, f) => sum + f.count, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Voltar</Link>
          <h1 className="text-4xl font-bold text-white mt-2">🧠 Second Brain</h1>
          <p className="text-gray-400 mt-1">
            {totalNotes} notas organizadas do Apple Notes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{totalNotes}</p>
            <p className="text-gray-400 text-sm">Total de Notas</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{folders.length}</p>
            <p className="text-gray-400 text-sm">Categorias</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">✓</p>
            <p className="text-gray-400 text-sm">Sincronizado</p>
          </div>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {folders.map((folder) => (
            <div
              key={folder.name}
              className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{folder.emoji}</span>
                <div>
                  <p className="text-white font-medium capitalize">
                    {folder.name.replace('/', ' / ')}
                  </p>
                  <p className="text-gray-400 text-sm">{folder.count} notas</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">📂 Acesso Rápido</h2>
          <div className="space-y-2 text-gray-300 font-mono text-sm">
            <p>📍 Local: <code className="bg-black/30 px-2 py-1 rounded">~/clawd/second-brain/</code></p>
            <p>📄 Índice: <code className="bg-black/30 px-2 py-1 rounded">~/clawd/second-brain/INDEX.md</code></p>
            <p>🎬 Ideias: <code className="bg-black/30 px-2 py-1 rounded">~/clawd/second-brain/nextleveldj/</code></p>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Atualizado automaticamente às 4h da manhã
        </div>
      </div>
    </main>
  );
}
