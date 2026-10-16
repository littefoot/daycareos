import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Brain, 
  Check, 
  ExternalLink,
  BarChart3,
  Table as TableIcon,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export interface BenchmarkModel {
  id: string;
  name: string;
  shortName: string;
  provider: 'Google Gemini' | 'OpenAI' | 'DeepSeek';
  providerId: 'gemini' | 'openai' | 'deepseek';
  intelligence: number; // Scale: 0 to 60 (Artificial Analysis Intelligence Index v4.3)
  inputPer1M: number;
  cachedInputPer1M?: number;
  outputPer1M: number;
  blendedCost: number; // Standard 3:1 input to output blended rate per 1M tokens
  valueRatio: number; // Bang for Buck = Intelligence / BlendedCost
  isRecommended?: boolean;
  isFrontier?: boolean;
  badge: string;
  barColor: string;
  accsUseCase: string;
}

// Exactly the 10 curated models across our 3 active providers
export const ACTIVE_MODELS_BENCHMARK: BenchmarkModel[] = [
  {
    id: 'gpt-6-astra',
    name: 'GPT-6 Astra (max)',
    shortName: 'GPT-6 Astra',
    provider: 'OpenAI',
    providerId: 'openai',
    intelligence: 53,
    inputPer1M: 10.00,
    cachedInputPer1M: 5.00,
    outputPer1M: 30.00,
    blendedCost: 15.00,
    valueRatio: 3.5,
    isFrontier: true,
    badge: 'Apex Frontier 2026',
    barColor: 'from-slate-950 via-slate-900 to-slate-800',
    accsUseCase: 'Deep legal and Ministry policy defense; state-of-the-art multi-step agency strategy.'
  },
  {
    id: 'gpt-5.6',
    name: 'ChatGPT 5.6 Sol (max)',
    shortName: 'GPT-5.6 Sol',
    provider: 'OpenAI',
    providerId: 'openai',
    intelligence: 47,
    inputPer1M: 5.00,
    cachedInputPer1M: 2.50,
    outputPer1M: 20.00,
    blendedCost: 8.75,
    valueRatio: 5.4,
    isFrontier: true,
    badge: 'Frontier Preview',
    barColor: 'from-slate-950 via-slate-900 to-slate-800',
    accsUseCase: 'Autonomous agency workflow planning, unannounced inspection audits, and Ministry appeals.'
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek-R1 (max)',
    shortName: 'DeepSeek-R1',
    provider: 'DeepSeek',
    providerId: 'deepseek',
    intelligence: 46,
    inputPer1M: 0.55,
    cachedInputPer1M: 0.14,
    outputPer1M: 2.19,
    blendedCost: 0.96,
    valueRatio: 47.9,
    isFrontier: true,
    badge: 'Deep Reasoning',
    barColor: 'from-blue-700 via-blue-600 to-indigo-600',
    accsUseCase: 'Complex CCEYA ratio edge cases (e.g. mixed infant/toddler math with provider own kids).'
  },
  {
    id: 'gpt-5.6-luna',
    name: 'GPT-5.6 Luna (max)',
    shortName: 'GPT-5.6 Luna',
    provider: 'OpenAI',
    providerId: 'openai',
    intelligence: 45,
    inputPer1M: 1.50,
    cachedInputPer1M: 0.75,
    outputPer1M: 6.00,
    blendedCost: 2.63,
    valueRatio: 17.1,
    isRecommended: true,
    isFrontier: true,
    badge: 'Recommended Default',
    barColor: 'from-slate-900 via-slate-800 to-zinc-700',
    accsUseCase: 'Default OpenAI Model: High-precision frontier reasoning for CCEYA ratio compliance, fee ledgers, and parent intake audits.'
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (high)',
    shortName: 'Gemini 3.8 Flash',
    provider: 'Google Gemini',
    providerId: 'gemini',
    intelligence: 41,
    inputPer1M: 0.15,
    cachedInputPer1M: 0.038,
    outputPer1M: 0.60,
    blendedCost: 0.26,
    valueRatio: 157.7,
    isRecommended: true,
    isFrontier: true,
    badge: 'Recommended Default',
    barColor: 'from-emerald-700 via-emerald-600 to-green-500',
    accsUseCase: 'Top Overall Bang-for-Buck: Sub-second streaming, 1M context, and live form schema mutations.'
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V4.1 Flash (max)',
    shortName: 'DeepSeek V4.1',
    provider: 'DeepSeek',
    providerId: 'deepseek',
    intelligence: 40,
    inputPer1M: 0.20,
    cachedInputPer1M: 0.05,
    outputPer1M: 0.80,
    blendedCost: 0.35,
    valueRatio: 114.3,
    isRecommended: true,
    isFrontier: true,
    badge: 'Recommended Value',
    barColor: 'from-blue-600 via-blue-500 to-cyan-600',
    accsUseCase: 'Latest DeepSeek 4.1 Flash: SOTA bang-for-buck with 75% prompt caching and sub-second reasoning.'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    shortName: 'Gemini 1.5 Pro',
    provider: 'Google Gemini',
    providerId: 'gemini',
    intelligence: 39,
    inputPer1M: 1.25,
    cachedInputPer1M: 0.313,
    outputPer1M: 5.00,
    blendedCost: 2.19,
    valueRatio: 17.8,
    badge: '2M Long Context',
    barColor: 'from-emerald-800 via-teal-700 to-emerald-600',
    accsUseCase: 'Ingesting 200+ page Ministry inspection manuals, historical audit binders, and municipal bylaws.'
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro 0813 (max)',
    shortName: 'DeepSeek V4 Pro',
    provider: 'DeepSeek',
    providerId: 'deepseek',
    intelligence: 36,
    inputPer1M: 0.45,
    cachedInputPer1M: 0.11,
    outputPer1M: 1.80,
    blendedCost: 0.79,
    valueRatio: 45.6,
    isFrontier: true,
    badge: 'Pro Reasoning',
    barColor: 'from-blue-700 via-indigo-600 to-blue-500',
    accsUseCase: 'DeepSeek V4 Pro: High-precision CCEYA compliance audits and complex multi-child subsidy ledger validation.'
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    shortName: 'GPT-4o Mini',
    provider: 'OpenAI',
    providerId: 'openai',
    intelligence: 34,
    inputPer1M: 0.15,
    cachedInputPer1M: 0.075,
    outputPer1M: 0.60,
    blendedCost: 0.26,
    valueRatio: 130.8,
    badge: 'Budget Value',
    barColor: 'from-slate-900 via-slate-800 to-zinc-700',
    accsUseCase: 'High-speed structured JSON workhorse with universal reliability across parent & provider forms.'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    shortName: 'Gemini 2.0 Flash',
    provider: 'Google Gemini',
    providerId: 'gemini',
    intelligence: 32,
    inputPer1M: 0.10,
    cachedInputPer1M: 0.025,
    outputPer1M: 0.40,
    blendedCost: 0.17,
    valueRatio: 188.2,
    badge: 'Current Stable',
    barColor: 'from-green-700 via-emerald-600 to-green-500',
    accsUseCase: 'Ultra-budget daily admissions Q&A, ratio checks, and rapid parent inquiry screening.'
  }
];

interface ApiPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelId?: string;
  onSelectModel?: (provider: 'gemini' | 'openai' | 'deepseek', modelId: string) => void;
}

export const ApiPricingModal: React.FC<ApiPricingModalProps> = ({
  isOpen,
  onClose,
  activeModelId,
  onSelectModel
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [sortMode, setSortMode] = useState<'intelligence' | 'value' | 'cost'>('intelligence');
  const [viewFormat, setViewFormat] = useState<'chart' | 'table'>('chart');
  const [inspectedModelId, setInspectedModelId] = useState<string>(activeModelId || 'gemini-3.8-flash');

  // Close modal on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter models based on selected provider
  const filteredModels = ACTIVE_MODELS_BENCHMARK.filter(m => {
    if (selectedProvider === 'all') return true;
    return m.providerId === selectedProvider;
  });

  // Sort models
  const sortedModels = [...filteredModels].sort((a, b) => {
    if (sortMode === 'intelligence') {
      return b.intelligence - a.intelligence;
    }
    if (sortMode === 'value') {
      return b.valueRatio - a.valueRatio;
    }
    return a.blendedCost - b.blendedCost;
  });

  const inspectedModel = ACTIVE_MODELS_BENCHMARK.find(m => m.id === inspectedModelId) || sortedModels[0];

  // Crisp Vector SVG Provider Icons
  const renderProviderIcon = (providerId: string) => {
    if (providerId === 'gemini') {
      return (
        <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0" title="Google Gemini">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
        </div>
      );
    }
    if (providerId === 'openai') {
      return (
        <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xs shrink-0" title="OpenAI">
          <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M22.28 9.25a5.55 5.55 0 0 0-.47-4.48 5.68 5.68 0 0 0-5.08-2.84 5.76 5.76 0 0 0-1.84.3A5.55 5.55 0 0 0 10.4 1a5.68 5.68 0 0 0-5.32 3.69 5.56 5.56 0 0 0-3.66 2.65 5.67 5.67 0 0 0 .54 5.8 5.55 5.55 0 0 0 .47 4.48 5.68 5.68 0 0 0 5.08 2.84 5.75 5.75 0 0 0 1.84-.3A5.55 5.55 0 0 0 13.6 23a5.68 5.68 0 0 0 5.32-3.69 5.56 5.56 0 0 0 3.66-2.65 5.67 5.67 0 0 0-.3-7.41zM13.6 21.6a4.26 4.26 0 0 1-2.45-.77l.12-.07 4.09-2.36a.71.71 0 0 0 .36-.61v-5.78l1.73 1a.06.06 0 0 1 .03.04v4.75a4.29 4.29 0 0 1-3.88 3.8zM4.32 17.65a4.23 4.23 0 0 1-.57-2.5 4.3 4.3 0 0 1 1.44-3.23l.11.07 4.09 2.36a.7.7 0 0 0 .71 0l5-2.89v2l-4.11 2.38a.07.07 0 0 1-.05 0l-4.11-2.38a4.34 4.34 0 0 1-2.51 4.19zm-1.85-8.5a4.24 4.24 0 0 1 1.88-1.73l.12.07 4.09 2.36a.71.71 0 0 0 .71 0l5 2.89-1.73 1a.06.06 0 0 1-.05 0L10.38 12l-4.11-2.37a4.3 4.3 0 0 1-3.8-3.48zM17.9 12l-5-2.89 1.73-1a.06.06 0 0 1 .05 0l4.11 2.37 4.11 2.37a4.3 4.3 0 0 1-.44 4.21 4.27 4.27 0 0 1-3.36 1.76v-.14l-4.09-2.36a.71.71 0 0 0-.71 0v-5.78zm3.62-2.15l-.12-.07-4.09-2.36a.7.7 0 0 0-.71 0l-5 2.89v-2l4.11-2.38a.07.07 0 0 1 .05 0l4.11 2.38a4.34 4.34 0 0 1 2.51 4.19 4.23 4.23 0 0 1-.86 2.35zM9.57 13.43l-1.73-1a.06.06 0 0 1-.03-.05V7.63a4.29 4.29 0 0 1 6.33-3.03l-.12.07-4.09 2.36a.71.71 0 0 0-.36.61v5.79zm1.2-1.39l2.23-1.29 2.23 1.29v2.58l-2.23 1.29-2.23-1.29z"/>
          </svg>
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center shadow-xs shrink-0 text-white font-black text-[10px]" title="DeepSeek">
        <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 13.5c-1.5 1.5-4.5 2-7.5.5-2.5-1.2-3.5-3.5-3.5-5 0-1.5 1-3 2.5-3.5 1.5-.5 3.5 0 4.5 1 1-1 3-1.5 4.5-1 1.5.5 2.5 2 2.5 3.5 0 1.5-1 3.8-3 4.5z"/>
          <circle cx="9" cy="11" r="1" fill="#2563eb" />
        </svg>
      </div>
    );
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b-2 border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6900] border border-orange-400 flex items-center justify-center text-white shadow-sm shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="pricing-modal-title" className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Artificial Analysis Intelligence & Price Index</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/30 text-purple-300 border border-purple-400/40 font-mono">
                    10 Active Models
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-300 font-medium hidden sm:block">
                Evaluations normalized across 10 benchmark suites with overlapping blended cost per 1M tokens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewFormat('chart')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewFormat === 'chart'
                    ? 'bg-[#ff6900] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bar Graph</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewFormat === 'table'
                    ? 'bg-[#ff6900] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Sort Controls */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          {/* Provider Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            {[
              { id: 'all', label: 'All Models (10)' },
              { id: 'gemini', label: 'Google Gemini (3)' },
              { id: 'openai', label: 'OpenAI / ChatGPT (4)' },
              { id: 'deepseek', label: 'DeepSeek (3)' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedProvider(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  selectedProvider === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
            <span>Sort by:</span>
            <button
              type="button"
              onClick={() => setSortMode('intelligence')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                sortMode === 'intelligence'
                  ? 'bg-orange-500 text-white font-black'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              🧠 Intelligence
            </button>
            <button
              type="button"
              onClick={() => setSortMode('value')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                sortMode === 'value'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              ⚡ Bang for Buck
            </button>
            <button
              type="button"
              onClick={() => setSortMode('cost')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                sortMode === 'cost'
                  ? 'bg-blue-600 text-white font-black'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              💵 Lowest Cost
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70 space-y-5">
          {viewFormat === 'chart' ? (
            /* ========================================================================= */
            /* MINIMAL OVERLAPPING BAR GRAPH (Inspired by Artificial Analysis Index)     */
            /* ========================================================================= */
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 sm:p-6 shadow-neo space-y-6">
              {/* Header Matching User Screenshot */}
              <div className="space-y-2 border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-slate-950 rounded-xs" />
                    <span className="font-serif text-xl font-black text-slate-950 tracking-tight">Intelligence</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-950 text-purple-200 uppercase tracking-wider">
                      Updated
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-700 text-xs font-bold font-mono">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-sans font-black">Artificial Analysis</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1">
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-black text-slate-950 flex items-center gap-1.5">
                      <span>Artificial Analysis Intelligence Index</span>
                      <span className="text-sm font-sans font-normal text-slate-400">↗</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 max-w-3xl mt-0.5 leading-snug">
                      Artificial Analysis Intelligence Index v4.3 incorporates 10 evaluations: AA-Briefcase, GDPval-AA v2, AutomationBench-AA, Terminal-Bench v4.0, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, AA-Omniscience, AA-LCR v1.1
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {sortedModels.length} of 10 models
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3 bg-slate-300 rounded-xs bg-[linear-gradient(45deg,#94a3b8_25%,transparent_25%,transparent_50%,#94a3b8_50%,#94a3b8_75%,transparent_75%,transparent)] bg-[length:6px_6px]" />
                    <span>Overlapping pill = Blended Cost / 1M tokens</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-bold">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-slate-900" />
                      <span>OpenAI</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-blue-600" />
                      <span>DeepSeek</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                      <span>Google Gemini</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal Bar Graph Visualizer */}
              <div className="space-y-0 pt-4">
                {/* Upper Area: Bars with Horizontal Grid Lines */}
                <div className="relative h-56 sm:h-64">
                  {/* Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-slate-300">
                    <div className="border-b border-dashed border-slate-200 w-full flex justify-between pr-2">
                      <span>60 —</span>
                    </div>
                    <div className="border-b border-dashed border-slate-200 w-full flex justify-between pr-2">
                      <span>45 —</span>
                    </div>
                    <div className="border-b border-dashed border-slate-200 w-full flex justify-between pr-2">
                      <span>30 —</span>
                    </div>
                    <div className="border-b border-dashed border-slate-200 w-full flex justify-between pr-2">
                      <span>15 —</span>
                    </div>
                    <div className="border-b border-transparent w-full flex justify-between pr-2">
                      <span>0 —</span>
                    </div>
                  </div>

                  {/* Columns of Bars */}
                  <div className="grid grid-cols-10 gap-1.5 sm:gap-2.5 h-full items-end relative z-10 px-2 sm:px-6">
                    {sortedModels.map((model) => {
                      const heightPercent = Math.min(100, Math.max(16, (model.intelligence / 60) * 100));
                      const isSelected = inspectedModelId === model.id;

                      const costBadgeColor = 
                        model.blendedCost <= 0.30
                          ? 'bg-emerald-600 text-white'
                          : model.blendedCost <= 2.00
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-900 text-white';

                      return (
                        <div
                          key={model.id}
                          onClick={() => setInspectedModelId(model.id)}
                          className="flex flex-col items-center justify-end h-full group cursor-pointer"
                          title={`${model.name} — Intelligence: ${model.intelligence}, Cost: $${model.blendedCost.toFixed(2)}/1M`}
                        >
                          {/* Overlapping Cost Pill (Pinned directly on top rim of bar) */}
                          <div className={`-mb-2.5 z-20 px-1 sm:px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[9px] font-black shadow-sm transition-transform group-hover:scale-110 flex items-center justify-center border border-white whitespace-nowrap ${costBadgeColor} ${
                            isSelected ? 'ring-2 ring-orange-500 scale-105' : ''
                          }`}>
                            ${model.inputPer1M < 1 ? model.inputPer1M.toFixed(2) : model.inputPer1M.toFixed(0)}/1M
                          </div>

                          {/* Main Intelligence Bar with Height */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 relative flex flex-col items-center justify-start pt-3 pb-1 px-0.5 border-x border-t ${
                              isSelected
                                ? 'border-orange-500 ring-2 ring-orange-500 shadow-neo-sm brightness-110'
                                : 'border-slate-900/60 hover:brightness-110'
                            } bg-gradient-to-t ${model.barColor}`}
                          >
                            {/* Intelligence Number inside bar at top */}
                            <span className="text-white font-black text-xs sm:text-sm tracking-tight drop-shadow-sm">
                              {model.intelligence}
                            </span>

                            {model.isRecommended && (
                              <span className="text-[10px] text-amber-300 font-black mt-0.5" title="Recommended Default">
                                ★
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Solid Baseline Anchor spanning all columns */}
                <div className="w-full h-0.5 bg-slate-900" />

                {/* Lower Area: Provider Icons & Rotated Labels */}
                <div className="grid grid-cols-10 gap-1.5 sm:gap-2.5 px-2 sm:px-6 pt-2 h-28">
                  {sortedModels.map((model) => {
                    const isSelected = inspectedModelId === model.id;
                    return (
                      <div
                        key={`label-${model.id}`}
                        onClick={() => setInspectedModelId(model.id)}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        {/* Provider Icon */}
                        <div className="mb-1 shrink-0">
                          {renderProviderIcon(model.providerId)}
                        </div>

                        {/* Rotated Model Name below Icon */}
                        <div className="h-20 w-full relative overflow-visible flex justify-center">
                          <div className={`absolute top-1 left-1/2 origin-top-left -rotate-45 text-[8.5px] sm:text-[10px] font-bold whitespace-nowrap transition-colors select-none ${
                            isSelected ? 'text-orange-600 font-black' : 'text-slate-700 hover:text-slate-900'
                          }`}>
                            {model.shortName}
                            {model.isRecommended && ' ★'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Selected Model Detail Card */}
              <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 bg-slate-900 text-white rounded-lg">
                      {inspectedModel.provider}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">
                      {inspectedModel.name}
                    </h4>
                    {inspectedModel.isRecommended && (
                      <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-400 text-emerald-900 text-[10px] font-black rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Recommended Default</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {inspectedModel.accsUseCase}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 pt-1">
                    <div className="flex items-center gap-1 text-slate-900 font-black">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span>Intelligence: {inspectedModel.intelligence}/60</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-black">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Input: ${inspectedModel.inputPer1M.toFixed(2)}/1M</span>
                      {inspectedModel.cachedInputPer1M && (
                        <span className="text-[10px] text-emerald-600 font-normal">
                          (Cached: ${inspectedModel.cachedInputPer1M.toFixed(3)})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-blue-700 font-black">
                      <span>Output: ${inspectedModel.outputPer1M.toFixed(2)}/1M</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600 font-black">
                      <TrendingUp className="w-4 h-4" />
                      <span>Value Ratio: {inspectedModel.valueRatio.toFixed(1)} pts/$</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {onSelectModel && (
                    <button
                      type="button"
                      onClick={() => onSelectModel(inspectedModel.providerId, inspectedModel.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-neo-sm cursor-pointer border-2 border-slate-900 ${
                        activeModelId === inspectedModel.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#ff6900] hover:bg-[#e05d00] text-white active:translate-x-0.5 active:translate-y-0.5'
                      }`}
                    >
                      {activeModelId === inspectedModel.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Currently Active</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Use This Model</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* FULL SPECIFICATIONS TABLE VIEW                                            */
            /* ========================================================================= */
            <div className="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-neo">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b-2 border-slate-900">
                      <th className="p-3 font-black">Model Name</th>
                      <th className="p-3 font-black">Provider</th>
                      <th className="p-3 font-black text-center">Intelligence (0–60)</th>
                      <th className="p-3 font-black text-right">Input / 1M</th>
                      <th className="p-3 font-black text-right">Cached / 1M</th>
                      <th className="p-3 font-black text-right">Output / 1M</th>
                      <th className="p-3 font-black text-right">Blended / 1M</th>
                      <th className="p-3 font-black text-center">Bang for Buck</th>
                      <th className="p-3 font-black text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedModels.map((m) => (
                      <tr 
                        key={m.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          inspectedModelId === m.id ? 'bg-orange-50/60' : ''
                        }`}
                      >
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{m.name}</span>
                            {m.isRecommended && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-300">
                                Default
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {renderProviderIcon(m.providerId)}
                            <span className="font-semibold text-slate-700">{m.provider}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-black text-slate-900 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                            {m.intelligence}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                          ${m.inputPer1M.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                          {m.cachedInputPer1M ? `$${m.cachedInputPer1M.toFixed(3)}` : '—'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                          ${m.outputPer1M.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-slate-900">
                          ${m.blendedCost.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            m.valueRatio >= 100
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : m.valueRatio >= 40
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {m.valueRatio.toFixed(1)} pts/$
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {onSelectModel && (
                            <button
                              type="button"
                              onClick={() => onSelectModel(m.providerId, m.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                                activeModelId === m.id
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-white hover:bg-orange-500 hover:text-white text-slate-800 border-slate-300 shadow-xs'
                              }`}
                            >
                              {activeModelId === m.id ? 'Active' : 'Select'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-600 text-[11px]">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              Values updated September 2026. Includes DeepSeek prompt caching discounts and Google Gemini 1M-token pricing.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://artificialanalysis.ai/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-500 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Artificial Analysis</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
