'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Doc {
  slug: string;
  folder: string;
  filename: string;
  title: string;
  date: string;
  type: string;
  tags: string[];
  summary: string;
  wordCount: number;
  relativePath: string;
}

interface Stats {
  total: number;
  byType: Record<string, number>;
  recentCount: number;
  totalWords: number;
}

interface FolderNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: FolderNode[];
  docSlug?: string;
  docType?: string;
}

const TYPE_ICONS: Record<string, string> = {
  journal: '📔', note: '📝', research: '🔬', idea: '💡',
  report: '📊', project: '📁', default: '📄',
};

export default function BrainPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<(Doc & { content?: string }) | null>(null);
  const [view, setView] = useState<'list' | 'tree'>('list');
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/documents').then(r => r.json()),
      fetch('/api/documents?view=stats').then(r => r.json()),
      fetch('/api/documents?view=tree').then(r => r.json()),
    ]).then(([d, s, t]) => {
      setDocs(d);
      setStats(s);
      setTree(t);
      setLoading(false);
    });
  }, []);

  const filtered = search
    ? docs.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.summary.toLowerCase().includes(search.toLowerCase()) ||
        d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : docs;

  const openDoc = async (slug: string) => {
    const res = await fetch(`/api/documents/${slug}`);
    const data = await res.json();
    setSelectedDoc(data);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderTree = (nodes: FolderNode[], depth = 0) => (
    <div style={{ marginLeft: depth * 16 }}>
      {nodes.map(node => (
        <div key={node.path}>
          {node.type === 'folder' ? (
            <>
              <button
                onClick={() => toggleFolder(node.path)}
                className="flex items-center gap-2 py-1.5 px-2 w-full text-left hover:bg-white/5 rounded text-gray-300 text-sm"
              >
                <span>{expandedFolders.has(node.path) ? '📂' : '📁'}</span>
                <span className="font-medium">{node.name}</span>
                <span className="text-gray-500 text-xs">({node.children?.length || 0})</span>
              </button>
              {expandedFolders.has(node.path) && node.children && renderTree(node.children, depth + 1)}
            </>
          ) : (
            <button
              onClick={() => node.docSlug && openDoc(node.docSlug)}
              className="flex items-center gap-2 py-1 px-2 w-full text-left hover:bg-white/5 rounded text-gray-400 text-sm"
            >
              <span>{TYPE_ICONS[node.docType || 'default'] || '📄'}</span>
              <span className="truncate">{node.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );

  if (selectedDoc) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedDoc(null)}
            className="text-gray-400 hover:text-white text-sm mb-4"
          >
            ← Voltar
          </button>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              <span>{TYPE_ICONS[selectedDoc.type] || '📄'}</span>
              <span>{selectedDoc.type}</span>
              <span>·</span>
              <span>{selectedDoc.date}</span>
              <span>·</span>
              <span>{selectedDoc.wordCount} palavras</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{selectedDoc.title}</h1>
            {selectedDoc.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedDoc.tags.map(t => (
                  <span key={t} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {selectedDoc.content || selectedDoc.summary}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Ferramentas</Link>
          <h1 className="text-3xl font-bold text-white mt-2">🧠 Second Brain</h1>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-gray-400 text-xs">Documentos</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{(stats.totalWords / 1000).toFixed(0)}k</p>
              <p className="text-gray-400 text-xs">Palavras</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.recentCount}</p>
              <p className="text-gray-400 text-xs">Últimos 7 dias</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{Object.keys(stats.byType).length}</p>
              <p className="text-gray-400 text-xs">Categorias</p>
            </div>
          </div>
        )}

        {/* Search + View Toggle */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-purple-500"
          />
          <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}
            >📋</button>
            <button
              onClick={() => setView('tree')}
              className={`px-3 py-2 text-sm ${view === 'tree' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}
            >🌳</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Carregando...</div>
        ) : view === 'tree' ? (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            {renderTree(tree)}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-500 text-xs mb-2">{filtered.length} documentos</p>
            {filtered.slice(0, 100).map(doc => (
              <button
                key={doc.slug}
                onClick={() => openDoc(doc.slug)}
                className="w-full text-left bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{TYPE_ICONS[doc.type] || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium text-sm truncate">{doc.title}</h3>
                      <span className="text-gray-600 text-xs flex-shrink-0">{doc.date}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{doc.summary}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600 text-xs">{doc.folder}</span>
                      <span className="text-gray-700 text-xs">·</span>
                      <span className="text-gray-600 text-xs">{doc.wordCount}w</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
