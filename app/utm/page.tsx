'use client';

import { useState, useRef } from 'react';
import Script from 'next/script';

const presets: Record<string, { source: string; medium: string; campaign: string }> = {
  instagram_bio: { source: 'instagram', medium: 'bio', campaign: 'arena_teamo' },
  instagram_stories: { source: 'instagram', medium: 'stories', campaign: 'arena_teamo' },
  facebook_feed: { source: 'facebook', medium: 'feed', campaign: 'arena_teamo' },
  tiktok: { source: 'tiktok', medium: 'bio', campaign: 'arena_teamo' },
  youtube: { source: 'youtube', medium: 'description', campaign: 'arena_teamo' },
  whatsapp: { source: 'whatsapp', medium: 'share', campaign: 'arena_teamo' },
};

export default function UTMGenerator() {
  const [url, setUrl] = useState('https://comunidade.omocodoteamo.com.br');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [content, setContent] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [history, setHistory] = useState<{ link: string; source: string; date: string }[]>([]);
  const [toast, setToast] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  function applyPreset(key: string) {
    const p = presets[key];
    setSource(p.source);
    setMedium(p.medium);
    setCampaign(p.campaign);
  }

  function generateLink() {
    if (!url || !source) {
      showToast('URL e utm_source são obrigatórios!');
      return;
    }

    const params = new URLSearchParams();
    params.append('utm_source', source);
    if (medium) params.append('utm_medium', medium);
    if (campaign) params.append('utm_campaign', campaign);
    if (content) params.append('utm_content', content);

    const separator = url.includes('?') ? '&' : '?';
    const link = url + separator + params.toString();
    setGeneratedLink(link);

    // QR Code
    if (qrRef.current && (window as any).QRCode) {
      qrRef.current.innerHTML = '';
      (window as any).QRCode.toCanvas(link, { width: 200, margin: 2 }, (err: any, canvas: HTMLCanvasElement) => {
        if (!err && qrRef.current) qrRef.current.appendChild(canvas);
      });
    }

    // History
    const item = { link, source, date: new Date().toLocaleString('pt-BR') };
    setHistory((prev) => [item, ...prev].slice(0, 10));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(generatedLink);
    showToast('Link copiado! 📋');
  }

  async function copyShort() {
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(generatedLink)}`);
      const short = await res.text();
      await navigator.clipboard.writeText(short);
      showToast('Link curto copiado! ✂️');
    } catch {
      await navigator.clipboard.writeText(generatedLink);
      showToast('Erro ao encurtar, link completo copiado');
    }
  }

  function downloadQR() {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const a = document.createElement('a');
      a.download = 'qrcode-arena-teamo.png';
      a.href = canvas.toDataURL();
      a.click();
      showToast('QR Code baixado! 📱');
    }
  }

  async function copyFromHistory(index: number) {
    await navigator.clipboard.writeText(history[index].link);
    showToast('Copiado do histórico!');
  }

  const inputClass = 'w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-400';

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js" />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <a href="/" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">← Voltar</a>
            <h1 className="text-4xl font-bold text-white mb-2">🔗 UTM Generator</h1>
            <p className="text-gray-300">Crie links com tracking para suas campanhas</p>
          </div>

          {/* Form */}
          <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-2xl mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">URL Base *</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://comunidade.omocodoteamo.com.br/convite/amor" />
              </div>

              {/* Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Presets Rápidos</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => applyPreset('instagram_bio')} className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm hover:opacity-90">📸 Instagram Bio</button>
                  <button onClick={() => applyPreset('instagram_stories')} className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm hover:opacity-90">📱 Stories</button>
                  <button onClick={() => applyPreset('facebook_feed')} className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm hover:opacity-90">👍 Facebook Feed</button>
                  <button onClick={() => applyPreset('tiktok')} className="px-3 py-1.5 bg-black text-white rounded-full text-sm hover:opacity-90">🎵 TikTok</button>
                  <button onClick={() => applyPreset('youtube')} className="px-3 py-1.5 bg-red-600 text-white rounded-full text-sm hover:opacity-90">▶️ YouTube</button>
                  <button onClick={() => applyPreset('whatsapp')} className="px-3 py-1.5 bg-green-500 text-white rounded-full text-sm hover:opacity-90">💬 WhatsApp</button>
                </div>
              </div>

              {/* UTM Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">utm_source *</label>
                  <input type="text" value={source} onChange={(e) => setSource(e.target.value)}
                    className={inputClass} placeholder="instagram, facebook..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">utm_medium</label>
                  <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)}
                    className={inputClass} placeholder="bio, stories, feed..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">utm_campaign</label>
                  <input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)}
                    className={inputClass} placeholder="lancamento, convite..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">utm_content</label>
                  <input type="text" value={content} onChange={(e) => setContent(e.target.value)}
                    className={inputClass} placeholder="cta_principal..." />
                </div>
              </div>

              <button onClick={generateLink}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:opacity-90 transition-all text-lg shadow-lg">
                ✨ Gerar Link
              </button>
            </div>
          </div>

          {/* Result */}
          {generatedLink && (
            <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">🎯 Seu Link</h2>
              <div className="bg-gray-900 rounded-lg p-4 mb-4 break-all">
                <code className="text-sm text-orange-300">{generatedLink}</code>
              </div>
              <div className="flex gap-3 mb-6">
                <button onClick={copyLink} className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all">📋 Copiar Link</button>
                <button onClick={copyShort} className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all">✂️ Copiar Curto</button>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">📱 QR Code</h3>
                <div ref={qrRef} className="inline-block bg-white p-4 rounded-xl shadow-md"></div>
                <div className="mt-3">
                  <button onClick={downloadQR} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-all">⬇️ Baixar QR Code</button>
                </div>
              </div>

              {history.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">📜 Histórico</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {history.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-900 rounded-lg p-2 text-sm">
                        <div className="truncate flex-1 mr-2">
                          <span className="text-orange-400 font-medium">{item.source}</span> -{' '}
                          <span className="text-gray-500">{item.date}</span>
                        </div>
                        <button onClick={() => copyFromHistory(i)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-white">📋</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-gray-500 text-sm">Feito com ❤️ pelo Theo</div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50">
            {toast}
          </div>
        )}
      </main>
    </>
  );
}
