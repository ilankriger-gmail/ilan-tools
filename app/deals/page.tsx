'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ============================================================
// Types
// ============================================================

type Stage =
  | 'inbox'
  | 'evaluating'
  | 'negotiating'
  | 'contracted'
  | 'delivered'
  | 'contract_signed'
  | 'invoice_sent'
  | 'paid'
  | 'lost'
  | 'rejected';

interface Deal {
  id: string;
  brand: string;
  contact: string;
  email: string;
  value: number; // BRL
  stage: Stage;
  platform: string; // instagram, youtube, tiktok, etc
  deliverables: string;
  deadline: string; // ISO date
  notes: string;
  lostReason?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Constants
// ============================================================

const STAGES: { key: Stage; label: string; emoji: string; color: string }[] = [
  { key: 'inbox', label: 'Recebida', emoji: '📥', color: 'bg-gray-700 border-gray-600' },
  { key: 'evaluating', label: 'Avaliando', emoji: '🔍', color: 'bg-yellow-900/40 border-yellow-700' },
  { key: 'negotiating', label: 'Negociando', emoji: '🤝', color: 'bg-blue-900/40 border-blue-700' },
  { key: 'contracted', label: 'Contratada', emoji: '📝', color: 'bg-purple-900/40 border-purple-700' },
  { key: 'delivered', label: 'Entregue', emoji: '✅', color: 'bg-green-900/40 border-green-700' },
  { key: 'contract_signed', label: 'Contrato Assinado', emoji: '📄', color: 'bg-teal-900/40 border-teal-700' },
  { key: 'invoice_sent', label: 'NF Emitida', emoji: '🧾', color: 'bg-indigo-900/40 border-indigo-700' },
  { key: 'paid', label: 'Paga', emoji: '💰', color: 'bg-emerald-900/40 border-emerald-700' },
  { key: 'lost', label: 'Perdida', emoji: '😞', color: 'bg-orange-900/40 border-orange-700' },
  { key: 'rejected', label: 'Rejeitada', emoji: '🚫', color: 'bg-red-900/40 border-red-700' },
];

const PLATFORMS = [
  'Instagram Reels',
  'Instagram Stories',
  'Instagram Post',
  'YouTube',
  'TikTok',
  'Twitter/X',
  'Multi-plataforma',
  'Evento',
  'Outro',
];

// ============================================================
// Helpers
// ============================================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(iso: string) {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  return diff;
}

// ============================================================
// API helpers
// ============================================================

async function fetchDeals(): Promise<Deal[]> {
  const res = await fetch('/api/deals');
  if (!res.ok) return [];
  return res.json();
}

async function saveDeal(deal: Deal): Promise<Deal | null> {
  const res = await fetch('/api/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deal),
  });
  if (!res.ok) return null;
  return res.json();
}

async function updateDeal(deal: Deal): Promise<Deal | null> {
  const res = await fetch('/api/deals', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deal),
  });
  if (!res.ok) return null;
  return res.json();
}

async function deleteDeal(id: string): Promise<boolean> {
  const res = await fetch(`/api/deals?id=${id}`, { method: 'DELETE' });
  return res.ok;
}

// ============================================================
// Components
// ============================================================

function DealCard({
  deal,
  onEdit,
  onMove,
  onLost,
  onReject,
}: {
  deal: Deal;
  onEdit: (d: Deal) => void;
  onMove: (id: string, stage: Stage) => void;
  onLost: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const days = daysUntil(deal.deadline);
  const urgent = days !== null && days >= 0 && days <= 3;

  // Find current stage index (excluding 'lost' and 'rejected')
  const activeStages = STAGES.filter((s) => s.key !== 'lost' && s.key !== 'rejected');
  const currentIdx = activeStages.findIndex((s) => s.key === deal.stage);
  const canGoBack = currentIdx > 0;
  const canGoForward = currentIdx < activeStages.length - 1;
  const prevStage = canGoBack ? activeStages[currentIdx - 1] : null;
  const nextStage = canGoForward ? activeStages[currentIdx + 1] : null;

  return (
    <div
      className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-gray-500 transition cursor-pointer group"
      onClick={() => onEdit(deal)}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-bold text-white text-lg">{deal.brand}</h4>
        <span className="text-emerald-400 font-bold text-sm whitespace-nowrap ml-2">
          {deal.value > 0 ? formatBRL(deal.value) : '$ TBD'}
        </span>
      </div>

      {deal.platform && (
        <span className="inline-block mt-1 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
          {deal.platform}
        </span>
      )}

      {deal.deliverables && (
        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{deal.deliverables}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        {deal.deadline ? (
          <span
            className={`text-xs ${urgent ? 'text-red-400 font-bold animate-pulse' : 'text-gray-500'}`}
          >
            {urgent ? '⚠️ ' : '📅 '}
            {formatDate(deal.deadline)}
            {days !== null && days >= 0 ? ` (${days}d)` : days !== null ? ' (venceu)' : ''}
          </span>
        ) : (
          <span />
        )}
        <span className="text-gray-600 text-xs">{deal.contact || deal.email}</span>
      </div>

      {/* Navigation arrows + Lost button */}
      <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          {/* Back arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (prevStage) onMove(deal.id, prevStage.key);
            }}
            disabled={!canGoBack}
            className={`text-sm px-2 py-1 rounded transition ${
              canGoBack
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-800 text-gray-700 cursor-not-allowed'
            }`}
            title={prevStage ? `← ${prevStage.label}` : ''}
          >
            ◀️
          </button>
          {/* Forward arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (nextStage) onMove(deal.id, nextStage.key);
            }}
            disabled={!canGoForward}
            className={`text-sm px-2 py-1 rounded transition ${
              canGoForward
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-800 text-gray-700 cursor-not-allowed'
            }`}
            title={nextStage ? `→ ${nextStage.label}` : ''}
          >
            ▶️
          </button>
        </div>

        {/* Lost + Reject buttons */}
        {deal.stage !== 'lost' && deal.stage !== 'rejected' && (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLost(deal.id);
              }}
              className="text-xs bg-orange-900/50 hover:bg-orange-800 text-orange-400 px-2 py-1 rounded transition font-medium"
              title="Cliente não seguiu"
            >
              😞 Perdida
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject(deal.id);
              }}
              className="text-xs bg-red-900/50 hover:bg-red-800 text-red-400 px-2 py-1 rounded transition font-medium"
              title="Não quero trabalhar com eles"
            >
              🚫 Rejeitar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DealModal({
  deal,
  onSave,
  onDelete,
  onClose,
}: {
  deal: Deal | null;
  onSave: (d: Deal) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const isNew = !deal;
  const [form, setForm] = useState<Deal>(
    deal || {
      id: generateId(),
      brand: '',
      contact: '',
      email: '',
      value: 0,
      stage: 'inbox',
      platform: '',
      deliverables: '',
      deadline: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const set = (key: keyof Deal, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val, updatedAt: new Date().toISOString() }));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">
            {isNew ? '➕ Nova Proposta' : `✏️ ${form.brand}`}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Marca / Empresa *</label>
              <input
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none"
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                placeholder="Ex: Levi's, Nike, Samsung..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Contato</label>
                <input
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none"
                  value={form.contact}
                  onChange={(e) => set('contact', e.target.value)}
                  placeholder="Nome da pessoa"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <input
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@marca.com"
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Valor (R$)</label>
                <input
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none"
                  value={form.value || ''}
                  onChange={(e) => set('value', Number(e.target.value.replace(/\D/g, '')))}
                  placeholder="25000"
                  type="number"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Deadline</label>
                <input
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none"
                  value={form.deadline}
                  onChange={(e) => set('deadline', e.target.value)}
                  type="date"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Plataforma</label>
              <select
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none"
                value={form.platform}
                onChange={(e) => set('platform', e.target.value)}
              >
                <option value="">Selecionar...</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Etapa</label>
              <select
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none"
                value={form.stage}
                onChange={(e) => set('stage', e.target.value)}
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Entregáveis</label>
              <textarea
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                rows={2}
                value={form.deliverables}
                onChange={(e) => set('deliverables', e.target.value)}
                placeholder="Ex: 1 Reels + 3 Stories + presença em evento"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Notas</label>
              <textarea
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mt-1 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Observações, histórico, links..."
              />
            </div>

            {form.lostReason && (
              <div className="p-3 bg-orange-900/30 border border-orange-700 rounded-lg">
                <label className="text-orange-400 text-sm font-medium">😞 Motivo da perda</label>
                <p className="text-orange-300 text-sm mt-1">{form.lostReason}</p>
              </div>
            )}

            {form.rejectedReason && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <label className="text-red-400 text-sm font-medium">🚫 Motivo da rejeição</label>
                <p className="text-red-300 text-sm mt-1">{form.rejectedReason}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                if (!form.brand.trim()) return alert('Nome da marca é obrigatório');
                onSave(form);
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition"
            >
              {isNew ? '➕ Adicionar' : '💾 Salvar'}
            </button>
            {!isNew && (
              <button
                onClick={() => {
                  if (confirm(`Deletar proposta "${form.brand}"?`)) onDelete(form.id);
                }}
                className="bg-red-900/50 hover:bg-red-800 text-red-300 font-bold py-3 px-5 rounded-xl transition"
              >
                🗑️
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 px-5 rounded-xl transition"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Summary Bar
// ============================================================

function SummaryBar({ deals }: { deals: Deal[] }) {
  const active = deals.filter((d) => !['paid', 'lost', 'rejected'].includes(d.stage));
  const pipeline = active.reduce((sum, d) => sum + d.value, 0);
  const paid = deals.filter((d) => d.stage === 'paid');
  const earned = paid.reduce((sum, d) => sum + d.value, 0);
  const urgent = active.filter((d) => {
    const days = daysUntil(d.deadline);
    return days !== null && days >= 0 && days <= 7;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm">Pipeline ativo</p>
        <p className="text-2xl font-bold text-white">{active.length}</p>
        <p className="text-emerald-400 text-sm font-medium">{formatBRL(pipeline)}</p>
      </div>
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm">Recebido total</p>
        <p className="text-2xl font-bold text-emerald-400">{formatBRL(earned)}</p>
        <p className="text-gray-500 text-sm">{paid.length} deals fechados</p>
      </div>
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm">Urgentes (7d)</p>
        <p className={`text-2xl font-bold ${urgent.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
          {urgent.length}
        </p>
        <p className="text-gray-500 text-sm">com deadline próximo</p>
      </div>
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm">Total histórico</p>
        <p className="text-2xl font-bold text-white">{deals.length}</p>
        <p className="text-gray-500 text-sm">propostas registradas</p>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [editDeal, setEditDeal] = useState<Deal | null | 'new'>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeals().then((data) => {
      setDeals(data);
      setLoaded(true);
    });
  }, []);

  const handleSave = useCallback(async (d: Deal) => {
    setSaving(true);
    const exists = deals.find((x) => x.id === d.id);
    let result: Deal | null;
    if (exists) {
      result = await updateDeal(d);
    } else {
      result = await saveDeal(d);
    }
    if (result) {
      if (exists) {
        setDeals((prev) => prev.map((x) => (x.id === result!.id ? result! : x)));
      } else {
        setDeals((prev) => [result!, ...prev]);
      }
    }
    setSaving(false);
    setEditDeal(null);
  }, [deals]);

  const handleDelete = useCallback(async (id: string) => {
    setSaving(true);
    const ok = await deleteDeal(id);
    if (ok) {
      setDeals((prev) => prev.filter((x) => x.id !== id));
    }
    setSaving(false);
    setEditDeal(null);
  }, []);

  const handleMove = useCallback(async (id: string, stage: Stage) => {
    const deal = deals.find((x) => x.id === id);
    if (!deal) return;
    const updated = { ...deal, stage, updatedAt: new Date().toISOString() };
    setDeals((prev) => prev.map((x) => (x.id === id ? updated : x)));
    await updateDeal(updated);
  }, [deals]);

  const handleLost = useCallback(async (id: string) => {
    const reason = prompt('😞 Qual o motivo da perda? (cliente não seguiu, etc)');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('É necessário informar o motivo.');
      return;
    }
    const deal = deals.find((x) => x.id === id);
    if (!deal) return;
    const updated = { ...deal, stage: 'lost' as Stage, lostReason: reason.trim(), updatedAt: new Date().toISOString() };
    setDeals((prev) => prev.map((x) => (x.id === id ? updated : x)));
    await updateDeal(updated);
  }, [deals]);

  const handleReject = useCallback(async (id: string) => {
    const reason = prompt('🚫 Por que não quer trabalhar com eles?');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('É necessário informar o motivo.');
      return;
    }
    const deal = deals.find((x) => x.id === id);
    if (!deal) return;
    const updated = { ...deal, stage: 'rejected' as Stage, rejectedReason: reason.trim(), updatedAt: new Date().toISOString() };
    setDeals((prev) => prev.map((x) => (x.id === id ? updated : x)));
    await updateDeal(updated);
  }, [deals]);

  // Export / Import
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(deals, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported: Deal[] = JSON.parse(text);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        setSaving(true);
        let count = 0;
        for (const d of imported) {
          const exists = deals.find((x) => x.id === d.id);
          if (exists) {
            await updateDeal(d);
          } else {
            await saveDeal(d);
          }
          count++;
        }
        // Refresh all deals from server
        const fresh = await fetchDeals();
        setDeals(fresh);
        setSaving(false);
        alert(`Importado! ${count} deals.`);
      } catch {
        alert('Arquivo inválido. Use um JSON exportado daqui.');
        setSaving(false);
      }
    };
    input.click();
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  const activeStages = STAGES.filter((s) => s.key !== 'lost' && s.key !== 'rejected');
  const lostDeals = deals.filter((d) => d.stage === 'lost');
  const rejectedDeals = deals.filter((d) => d.stage === 'rejected');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm mb-2 block">
              ← Voltar
            </Link>
            <h1 className="text-4xl font-bold text-white">
              💼 Deal Tracker
            </h1>
            <p className="text-gray-400 mt-1">Pipeline de propostas comerciais</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {saving && (
              <span className="text-yellow-400 text-sm self-center animate-pulse">💾 Salvando...</span>
            )}
            <button
              onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
            >
              {viewMode === 'kanban' ? '📋 Lista' : '📊 Kanban'}
            </button>
            <button
              onClick={handleExport}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
            >
              📤 Exportar
            </button>
            <button
              onClick={handleImport}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
            >
              📥 Importar
            </button>
            <button
              onClick={() => setEditDeal('new')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg text-sm transition"
            >
              ➕ Nova Proposta
            </button>
          </div>
        </div>

        {/* Summary */}
        <SummaryBar deals={deals} />

        {/* Kanban View */}
        {viewMode === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-8 snap-x">
            {activeStages.map((stage) => {
              const stageDealsList = deals
                .filter((d) => d.stage === stage.key)
                .sort((a, b) => b.value - a.value);
              const stageTotal = stageDealsList.reduce((s, d) => s + d.value, 0);

              return (
                <div
                  key={stage.key}
                  className={`flex-shrink-0 w-72 ${stage.color} rounded-2xl border p-4 snap-start`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">
                      {stage.emoji} {stage.label}
                    </h3>
                    <span className="bg-gray-800/60 text-gray-300 text-xs px-2 py-1 rounded-full">
                      {stageDealsList.length}
                    </span>
                  </div>
                  {stageTotal > 0 && (
                    <p className="text-emerald-400/80 text-sm font-medium mb-3">
                      {formatBRL(stageTotal)}
                    </p>
                  )}
                  <div className="space-y-3">
                    {stageDealsList.map((d) => (
                      <DealCard
                        key={d.id}
                        deal={d}
                        onEdit={setEditDeal}
                        onMove={handleMove}
                        onLost={handleLost}
                        onReject={handleReject}
                      />
                    ))}
                    {stageDealsList.length === 0 && (
                      <p className="text-gray-600 text-sm text-center py-8">Nenhuma proposta</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-gray-800/40 rounded-2xl border border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4 text-gray-400 text-sm font-medium">Marca</th>
                  <th className="p-4 text-gray-400 text-sm font-medium">Etapa</th>
                  <th className="p-4 text-gray-400 text-sm font-medium">Valor</th>
                  <th className="p-4 text-gray-400 text-sm font-medium">Plataforma</th>
                  <th className="p-4 text-gray-400 text-sm font-medium">Deadline</th>
                  <th className="p-4 text-gray-400 text-sm font-medium">Contato</th>
                </tr>
              </thead>
              <tbody>
                {deals
                  .filter((d) => d.stage !== 'rejected' && d.stage !== 'lost')
                  .sort((a, b) => {
                    const si = STAGES.findIndex((s) => s.key === a.stage);
                    const sj = STAGES.findIndex((s) => s.key === b.stage);
                    return si - sj || b.value - a.value;
                  })
                  .map((d) => {
                    const stage = STAGES.find((s) => s.key === d.stage)!;
                    const days = daysUntil(d.deadline);
                    const urgent = days !== null && days >= 0 && days <= 3;
                    return (
                      <tr
                        key={d.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition"
                        onClick={() => setEditDeal(d)}
                      >
                        <td className="p-4 text-white font-medium">{d.brand}</td>
                        <td className="p-4">
                          <span className="text-sm bg-gray-700 px-2 py-1 rounded-full text-gray-300">
                            {stage.emoji} {stage.label}
                          </span>
                        </td>
                        <td className="p-4 text-emerald-400 font-medium">
                          {d.value > 0 ? formatBRL(d.value) : '—'}
                        </td>
                        <td className="p-4 text-gray-400 text-sm">{d.platform || '—'}</td>
                        <td className={`p-4 text-sm ${urgent ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                          {formatDate(d.deadline)}
                        </td>
                        <td className="p-4 text-gray-500 text-sm">{d.contact || d.email || '—'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Lost (collapsed) */}
        {lostDeals.length > 0 && (
          <details className="mt-6">
            <summary className="text-orange-400/70 cursor-pointer hover:text-orange-300 text-sm">
              😞 {lostDeals.length} proposta(s) perdida(s)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {lostDeals.map((d) => (
                <div key={d.id}>
                  <DealCard deal={d} onEdit={setEditDeal} onMove={handleMove} onLost={handleLost} onReject={handleReject} />
                  {d.lostReason && (
                    <div className="mt-1 mx-1 px-3 py-2 bg-orange-900/30 border border-orange-800/50 rounded-lg">
                      <p className="text-xs text-orange-400">
                        <span className="font-medium">Motivo:</span> {d.lostReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Rejected (collapsed) */}
        {rejectedDeals.length > 0 && (
          <details className="mt-6">
            <summary className="text-red-400/70 cursor-pointer hover:text-red-300 text-sm">
              🚫 {rejectedDeals.length} proposta(s) rejeitada(s)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {rejectedDeals.map((d) => (
                <div key={d.id}>
                  <DealCard deal={d} onEdit={setEditDeal} onMove={handleMove} onLost={handleLost} onReject={handleReject} />
                  {d.rejectedReason && (
                    <div className="mt-1 mx-1 px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg">
                      <p className="text-xs text-red-400">
                        <span className="font-medium">Motivo:</span> {d.rejectedReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Empty state */}
        {deals.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">💼</p>
            <h2 className="text-2xl font-bold text-white mb-2">Nenhuma proposta ainda</h2>
            <p className="text-gray-400 mb-6">Adicione sua primeira proposta comercial</p>
            <button
              onClick={() => setEditDeal('new')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition"
            >
              ➕ Nova Proposta
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {editDeal !== null && (
        <DealModal
          deal={editDeal === 'new' ? null : editDeal}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditDeal(null)}
        />
      )}
    </main>
  );
}
